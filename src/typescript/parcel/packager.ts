import {basename} from 'path'

import Packager = require('parcel-bundler/lib/packagers/Packager')
import JSPackager = require('parcel-bundler/src/packagers/JSPackager')

import {addBundle, addFile} from '../ipc'
import {getBundleConfig} from '../utils/config'

function normalize(asset: any) {
	return asset.name.replace(/\.[^\.]+$/, `.${asset.type}`)
}

enum OptimizationLevel {
	Simple = 'simple', Advanced = 'advanced'
}

class ClosurePackager extends Packager {
	private readonly files: string[] = []
	private readonly packages = new Set<string>()
	private readonly childs: string[] = []
	private readonly promises: Array<Promise<void>> = []

	public setup() {
		return
	}

	public async end() {
		if(this.bundle.entryAsset) {
			const parent = basename(this.bundle.parentBundle.name)
			const entry = normalize(this.bundle.entryAsset)
			const {exports, optimization} = getBundleConfig(entry)

			await Promise.all(this.promises.splice(0))
			await addBundle({
				name: basename(this.bundle.name),
				out: this.bundle.name,
				entry: normalize(this.bundle.entryAsset),
				childs: this.childs,
				files: this.files,
				packages: [...this.packages],
				parent: /\.js$/.test(parent) ? parent : null,
				optimization: optimization === 'advanced' ? OptimizationLevel.Advanced : OptimizationLevel.Simple,
				publicURL: this.options.publicURL,
				exports
			})
		}

		return
	}

	public async addAsset(asset: any) {
		const pkgfile = asset.package && asset.package.pkgfile

		if(pkgfile && /node_modules/.test(asset.name)) {
			this.packages.add(pkgfile)
		}

		const path = normalize(asset)

		if(!/parcel-bundler.(src)|(lib).builtins.bundle-loader.js/.test(asset.name)) {
			this.files.push(path)

			if (!/node_modules\/rxjs/.test(asset.name)) {
				this.promises.push(Promise.resolve(await addFile(path, asset.generated.js, pkgfile)))
			}
		}

		for(const dep of asset.dependencies.values()) {
			const mod = asset.depAssets.get(dep.name)

			if(dep.dynamic) {
				this.childs.push(mod.name)
			}
		}
	}
}

export = function(bundle: any, bundler: any) {
	const config = bundle.entryAsset && getBundleConfig(bundle.entryAsset.name)

	if(config && config.optimization === 'uglify') {
		return new JSPackager(bundle, bundler)
	}
	else {
		return new ClosurePackager(bundle, bundler)
	}
}

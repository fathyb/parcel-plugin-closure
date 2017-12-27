// TODO: refactor everything when stable

import {dirname, join} from 'path'

import findNodeModules = require('find-node-modules')

import {Bundle, Request} from '../interfaces'
import {Handler} from '../ipc'
import {readFile, writeFile} from '../utils/fs'

import {createClosureWrapper} from './api'

function optionalResolve(...paths: string[]): string[] {
	return paths
		.map(path => {
			try {
				return require.resolve(path)
			}
			catch {
				return null
			}
		})
		.filter(path => !!path) as string[]
}

export class Bridge implements Handler<Request, Response> {
	private readonly pendingBundles: Bundle[] = []
	private readonly mappings: {[path: string]: string} = {}
	private wrapper = createClosureWrapper()
	private loaderPath: string|null = null

	public async addBundle(bundle: Bundle): Promise<void> {
		this.pendingBundles.push(bundle)

		const tree = this.tree()

		if(tree.length === 0) {
			return
		}

		tree.forEach(bundles => {
			this.dedupe(bundles)

			bundles.forEach(item => this.removeBundle(item))
		})

		for(const bundles of tree) {
			const root = bundles.find(({parent}) => !parent)!
			const rootDir = dirname(root.entry)

			bundles.forEach(({childs, publicURL}) =>
				childs.forEach(child => {
					const childBundle = this.bundleByEntry(child, bundles)!
					const relative = child.replace(rootDir, '').replace(/(^\/)|(\.js$)/g, '')

					this.mappings[relative] = `${publicURL.replace(/\/$/g, '')}/${childBundle.name}`
				})
			)

			await this.commitMappings()

			const wrapper = await this.wrapper
			const result = await wrapper.process({
				modules: bundles.map(({entry, files, name, packages, parent, exports}) => ({
					entry, name, exports,
					files: files.concat(packages),
					dependencies: parent ? [this.bundleByName(parent, bundles)!.name] : []
				})),
				externs: optionalResolve(
					'zone.js/dist/zone_externs',
					'@angular/core/src/testability/testability.externs',
					'../externs/angular',
					'../externs/require'
				),
				optimization: root.optimization === 'advanced'
					? 'ADVANCED_OPTIMIZATIONS'
					: 'SIMPLE_OPTIMIZATIONS'
			})

			await Promise.all(result.map(({name, contents}) =>
				writeFile(this.bundleByName(name, bundles)!.out, contents)
			))
		}
	}

	public async addFile(
		{contents, packageFile, path}: {path: string, contents: string|null, packageFile: string|null}
	) {
		if(!this.loaderPath) {
			const nodeModules = findNodeModules({
				cwd: dirname(path),
				relative: false
			}).pop()!
			const injectPath = join(nodeModules, '_bundle_loader')
			const index = join(injectPath, 'index.js')
			const pkg = join(injectPath, 'package.json')
			const pkgContents = JSON.stringify({
				name: '_bundle_loader',
				main: 'index.js'
			})

			this.loaderPath = injectPath

			this.wrapper = this.wrapper.then(async wrapper => {
				const indexFile = await readFile(require.resolve('./bundle-loader'))

				await wrapper.addFile(index, indexFile.replace('__REPLACE_MAPPINGS', '{}'), pkg, pkgContents)

				return wrapper
			})
		}

		return (await this.wrapper).addFile(path, contents, packageFile, null)
	}

	private async commitMappings() {
		const contents = await readFile(require.resolve('./bundle-loader'))
		const wrapper = await this.wrapper
		const mappings = JSON.stringify(this.mappings)
		const index = join(this.loaderPath!, 'index.js')

		await wrapper.addFile(index, contents.replace('__REPLACE_MAPPINGS', mappings), null, null)
	}

	private removeBundle(bundle: Bundle) {
		const index = this.pendingBundles.indexOf(bundle)

		if(index === -1) {
			throw new Error('Cannot find bundle')
		}

		this.pendingBundles.splice(index, 1)
	}

	private bundleByEntry(entry: string, bundles = this.pendingBundles): Bundle|undefined {
		return bundles.find(bundle => bundle.entry === entry)
	}

	private bundleByName(name: string, bundles = this.pendingBundles): Bundle|undefined {
		return bundles.find(bundle => bundle.name === name)
	}

	private getNumberOfParents(bundle: Bundle, bundles: Bundle[]): number {
		let parents = 0

		this.visitParents(bundle, bundles, () => {
			parents++

			return true
		})

		return parents
	}

	private tree(bundles = this.pendingBundles) {
		const map: {[root: string]: Bundle[]} = {}

		for(const bundle of bundles) {
			let name = bundle.name

			if(bundle.parent) {
				let parentBundle = this.bundleByName(bundle.parent, bundles)

				if(!parentBundle) {
					continue
				}

				let found = true

				while(parentBundle.parent) {
					const next = this.bundleByName(parentBundle.parent)

					if(!next) {
						found = false

						break
					}

					parentBundle = next
				}

				if(!found) {
					continue
				}

				name = parentBundle.name
			}

			let childMissing = false

			for(const child of bundle.childs) {
				const childBundle = this.bundleByEntry(child)

				if(!childBundle) {
					childMissing = true

					break
				}
			}

			if(childMissing) {
				continue
			}

			const list = map[name]

			if(list) {
				list.push(bundle)
			}
			else {
				map[name] = [bundle]
			}
		}

		return Object
			.keys(map)
			// Closure requires modules to be sorted by dependency order
			.map(name =>
				map[name].sort((a, b) =>
					this.getNumberOfParents(a, bundles) - this.getNumberOfParents(b, bundles)
				)
			)
	}

	private dedupe(bundles: Bundle[]) {
		let root: Bundle|null = null

		for(const bundle of bundles) {
			if(!bundle.parent || /\.html$/.test(bundle.parent)) {
				if(root) {
					throw new Error('Multiple parent bundles')
				}

				root = bundle
			}
		}

		if(!root) {
			throw new Error('Cannot find root bundle')
		}

		const {loaderPath} = this

		if(!loaderPath) {
			throw new Error('invariant error: loaderPath is null')
		}

		root.files.push(join(loaderPath, 'index.js'), join(loaderPath, 'package.json'))

		for(const bundle of bundles) {
			const {files} = bundle

			for(let i = 0; i < files.length; i++) {
				const file = files[i]
				const parentHasDep = this.visitParents(bundle, bundles, parent => parent.files.indexOf(file) !== -1)

				if(parentHasDep) {
					files.splice(i--, 1)
				}
			}
		}
	}

	private visitParents(bundle: Bundle, bundles: Bundle[], fn: (parent: Bundle) => boolean) {
		let current = bundle

		while(current.parent) {
			const parent = this.bundleByName(current.parent, bundles)

			if(parent) {
				if(fn(parent)) {
					return true
				}

				current = parent
			}
			else {
				break
			}
		}

		return false
	}
}

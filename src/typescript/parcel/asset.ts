import JSAsset = require('parcel-bundler/lib/assets/JSAsset')
import collectDependencies = require('parcel-bundler/lib/visitors/dependencies')
import { getBundleConfig } from '../utils/config';

export = class ClosureJSAsset extends JSAsset {
	public collectDependencies() {
		this.traverseFast({
			...collectDependencies,
			ImportDeclaration(node: any, asset: JSAsset) {
				collectDependencies.ImportDeclaration(node, asset)
			}
		})

		const config = getBundleConfig(this.name)

		if(config.optimization !== 'uglify') {
			// Keep ES6 imports/exports to improve Closure's tree-shaking
			this.isES6Module = false
		}

		// Disable Uglify, for performances and to keep types annotations
		this.options.minify = false
	}
}

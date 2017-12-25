import JSAsset = require('parcel-bundler/lib/assets/JSAsset')

export = class ClosureJSAsset extends JSAsset {
	public collectDependencies() {
		super.collectDependencies()

		// Keep ES6 imports/exports to improve Closure's tree-shaking
		this.isES6Module = false

		// Disable Uglify, for performances and to keep types annotations
		this.options.minify = false
	}
}

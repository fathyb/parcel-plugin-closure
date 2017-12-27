import {ClosureServer} from './compiler/worker'
import {getConfig} from './utils/config'

export = (bundler: any) => {
	const config = getConfig()
	const {watch} = bundler.options
	const shouldBuild = (watch && config.watch) || (!watch && config.build)

	if(!shouldBuild) {
		return
	}

	// process.send is only defined on the main process
	if(!process.send) {
		// create a server controlling a child process running Closure
		const server = new ClosureServer()

		if(!watch) {
			// in build mode close the server when the build is finished to prevent the process from hanging
			bundler.on('buildEnd', () => server.close())
		}
	}

	bundler.options.__minifyUsingClosure = true
	bundler.addPackager('js', require.resolve('./parcel/packager'))

	if(!bundler.options.__closureKeepJSAsset) {
		bundler.addAssetType('js', require.resolve('./parcel/asset'))
	}
}

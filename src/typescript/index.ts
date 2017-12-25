import {getConfig} from './utils/config'
import {Server} from './ipc/server'

export = (bundler: any) => {
	const config = getConfig()
	const {watch} = bundler.options
	const shouldBuild = (watch && config.watch) || (!watch && config.build)

	if(!shouldBuild) {
		return
	}


	// process.send is only defined on the main process
	if(!process.send) {
		const server = new Server()

		if(!watch) {
			// in build mode we close our IPC server when the build is finished to prevent the process from hanging
			bundler.on('buildEnd', () => server.close())
		}
	}

	bundler.options.minifyUsingClosure = true
	bundler.addPackager('js', require.resolve('./parcel/packager'))
	bundler.addAssetType('js', require.resolve('./parcel/asset'))
}

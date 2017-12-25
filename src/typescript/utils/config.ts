import {dirname, resolve} from 'path'
import rc = require('rc')

const APP_NAME = 'parcelclosure'

export interface BundleConfiguration {
	optimization: 'simple'|'advanced'
	exports: string[]|null
}

export interface Configuration {
	externs: string[]
	watch: boolean
	build: boolean
	bundles: {
		[entry: string]: BundleConfiguration
	}
}

const DefaultBundleConfig: BundleConfiguration = {
	optimization: 'advanced',
	exports: null
}
const DefaultConfig: Configuration = {
	watch: false,
	build: true,
	externs: [],
	bundles: {}
}

let config: Configuration|null = null

export function getConfig(): Configuration {
	if(config) {
		return config
	}

	const parsed = rc(APP_NAME, DefaultConfig)

	if(!parsed || !parsed.config) {
		return config = DefaultConfig
	}

	Object.keys(parsed.bundles).forEach(entry =>
		parsed.bundles[parseBundleEntry(entry, parsed.config)] = {
			...DefaultBundleConfig,
			...parsed.bundles[entry]
		}
	)

	config = parsed

	return parsed
}

export function getBundleConfig(entry: string): BundleConfiguration {
	return getConfig().bundles[parseBundleEntry(entry)] || DefaultBundleConfig
}

function parseBundleEntry(entry: string, configPath?: string) {
	let path = configPath ? resolve(dirname(configPath), entry) : entry

	if(!/\.js$/.test(path)) {
		path += '.js'
	}

	return path
}

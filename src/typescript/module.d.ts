declare module 'when/node' {
	export function lift(funct: (...args: any[]) => any, receiver?: any): (...args: any[]) => any
}

declare module 'parcel-bundler/lib/visitors/dependencies'
declare module 'parcel-bundler/lib/packagers/Packager' {
	class Packager {
		public bundle: any
		public bundler: any
		public options: any

		constructor(bundle: any, bundler: any)

		public setup(): void
		public addAsset(asset: any): Promise<void>
		public start(): Promise<void>
		public end(): Promise<void>
	}

	export = Packager
}
declare module 'parcel-bundler/src/packagers/JSPackager' {
	import Packager = require('parcel-bundler/lib/packagers/Packager')

	export = Packager
}

declare module 'parcel-bundler/lib/assets/JSAsset' {
	class JSAsset {
		public name: string
		public contents?: string
		public options?: any
		public package?: any
		public dependencies: Map<string, string>
		public depAssets: Map<string, any>

		protected isES6Module: boolean

		constructor(name: string, pkg: string, options: any)

		public parse(code: string): Promise<any>
		public load(): Promise<string>
		public addURLDependency(url: string, from?: string, opts?: {}): string
		public addDependency(url: string, opts: {}): string
		public collectDependencies(): void
		public transform(): Promise<void>
		public pretransform(): Promise<void>
		public traverseFast(fn: (...args: any[]) => void): void
	}

	export = JSAsset
}

declare module 'find-node-modules' {
	function findNodeModules(options?: {
		cwd?: string,
		relative?: boolean
	}): string[]

	export = findNodeModules
}

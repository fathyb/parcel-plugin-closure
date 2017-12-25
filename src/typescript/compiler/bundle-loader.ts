export = (url: string) => {
	let promise = cache.get(url)

	if(promise) {
		return promise
	}

	cache.set(url, promise = new Promise<any>((resolve, reject) => {
		const script = document.createElement('script')
		const name = url.split('/').pop()!.replace(/\.js$/, '')

		script.src = url
		script.onerror = reject

		listeners.set(name, (e: any) => {
			const renamed: StringMap = {}

			Object.keys(e).forEach(alias => renamed[renamings[alias]] = e[alias])

			resolve(renamed)
		})

		const parent = document.head || document.documentElement

		parent.appendChild(script)
	}))

	return promise
}

declare const __REPLACE_MAPPINGS: StringMap
declare const __REPLACE_RENAMINGS: StringMap

interface StringMap {
	[key: string]: string
}

const cache = new Map<string, Promise<any>>()
const listeners = new Map<string, (e: any) => void>()
const ctx = window as any

const mappings: StringMap = __REPLACE_MAPPINGS
const renamings: StringMap = __REPLACE_RENAMINGS

ctx.require = {
	resolve: (path: string): string => mappings[path]
}
ctx.__C = function(name: string, exports: any): void {
	const listener = listeners.get(name)

	if(listener) {
		listener(exports)
	}
}

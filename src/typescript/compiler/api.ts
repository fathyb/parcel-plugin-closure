import java = require('java')
import {lift} from 'when/node'

java.classpath.push(require.resolve('google-closure-compiler/compiler.jar'))
java.classpath.push(require.resolve('../../../build/kotlin/libs/runtime.jar'))

java.asyncOptions = {
	asyncSuffix: undefined,
	syncSuffix: '',
	promiseSuffix: 'P',
	promisify: lift as any
}

async function createInstance(name: string, ...args: any[]): Promise<any> {
	await java.ensureJvm()

	return java.newInstanceP(name, ...args)
}

export async function createClosureWrapper(): Promise<ClosureWrapper> {
	const wrapper = await createInstance('org.fathyb.parcel.closure.ClosureWrapper')

	return {
		addFile(path, contents, pkg, pkgContents) {
			return wrapper.addFileP(path, contents, pkg, pkgContents)
		},
		async process(params) {
			return JSON.parse(await wrapper.processP(JSON.stringify(params)))
		}
	}
}

export interface GeneratedFile {
	name: string
	contents: string
}

export interface ClosureWrapper {
	addFile(path: string, contents: string|null, pkgFile: string|null, pkgContents: string|null): Promise<void>
	process(params: Parameters): Promise<GeneratedFile[]>
}

export interface Module {
	name: string
	entry: string
	files: string[]
	dependencies: string[]
	exports: string[]|null
}

export interface Parameters {
	modules: Module[]
	externs: string[]
	optimization: 'SIMPLE_OPTIMIZATIONS'|'ADVANCED_OPTIMIZATIONS'
}

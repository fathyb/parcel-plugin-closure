// tslint:disable:no-empty-interface

import {Bundle} from '../interfaces'

export namespace Request {
	export interface AddBundle {
		bundle: Bundle
	}

	export interface AddFile {
		path: string
		contents: string|null
		packageFile: string|null
	}

	export interface Map {
		addBundle: AddBundle
		addFile: AddFile
	}
}

export namespace Response {
	export interface Map {
		addBundle: void
		addFile: void
	}
}

export interface Bundle {
	name: string
	out: string
	entry: string
	childs: string[]
	parent: string|null
	packages: string[]
	optimization: 'simple'|'advanced'
	files: string[]
	publicURL: string
	exports: string[]|null
}

export interface ProcessedFile {
	path: string
	contents: string|null
	packageFile: string|null
}

export interface Request {
	addBundle: Bundle
	addFile: ProcessedFile
}

export interface Response {
	addBundle: void
	addFile: void
}

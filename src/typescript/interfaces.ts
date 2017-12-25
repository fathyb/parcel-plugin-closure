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

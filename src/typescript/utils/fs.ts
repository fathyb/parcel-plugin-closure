import * as fs from 'fs'

export function readFile(path: string): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		fs.readFile(path, {encoding: 'utf-8'}, (err, result) => {
			if(err) {
				reject(err)
			}
			else {
				resolve(result)
			}
		})
	})
}
export function writeFile(path: string, contents: string): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		fs.writeFile(path, contents, err => {
			if(err) {
				reject(err)
			}
			else {
				resolve()
			}
		})
	})
}

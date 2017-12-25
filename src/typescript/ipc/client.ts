import rp = require('request-promise')

import {Bundle} from '../interfaces'

import {getSocketPath} from './dynamic'
import {Request, Response} from './protocol'

async function request<K extends keyof Request.Map, R extends Response.Map[K]>(
	endpoint: K, data: Request.Map[K]
): Promise<R> {
	const response: {result?: R, error?: any} = await rp({
		uri: `http://unix:${getSocketPath()}:/${endpoint}`,
		method: 'POST',
		body: data,
		json: true
	})

	if(response.error) {
		throw new Error(response.error)
	}

	return response.result!
}

export async function addBundle(bundle: Bundle): Promise<void> {
	await request('addBundle', {bundle})
}

export async function addFile(path: string, contents: string|null, packageFile: string|null): Promise<void> {
	await request('addFile', {path, contents, packageFile})
}

import rp = require('request-promise')

import {Bundle, Request, Response} from '../interfaces'

import {getSocketPath} from './dynamic'

async function request<K extends keyof Request, R extends Response[K]>(
	endpoint: K, data: Request[K]
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
	return request('addBundle', bundle)
}

export async function addFile(path: string, contents: string|null, packageFile: string|null): Promise<void> {
	return request('addFile', {path, contents, packageFile})
}

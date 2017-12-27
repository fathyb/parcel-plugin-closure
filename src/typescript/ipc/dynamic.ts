import {tmpNameSync} from 'tmp'

export function setSocketPath(): string {
	if(process.env.PARCEL_CLOSURE_SOCKET) {
		throw new Error('[parcel-plugin-closure]: socket already defined')
	}

	return process.env.PARCEL_CLOSURE_SOCKET = tmpNameSync()
}

export function getSocketPath(): string {
	const {PARCEL_CLOSURE_SOCKET} = process.env

	if(!PARCEL_CLOSURE_SOCKET) {
		throw new Error('Cannot find Closure plugin IPC socket')
	}

	return PARCEL_CLOSURE_SOCKET
}

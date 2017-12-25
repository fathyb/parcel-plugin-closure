import {tmpNameSync} from 'tmp'

export function getSocketPath(): string {
	if(!process.env.PARCEL_CLOSURE_SOCKET) {
		return process.env.PARCEL_CLOSURE_SOCKET = tmpNameSync()
	}

	return process.env.PARCEL_CLOSURE_SOCKET!
}

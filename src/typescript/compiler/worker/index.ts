import {getSocketPath} from '../../ipc/dynamic'
import {Request, Response} from '../../ipc/protocol'
import {Worker} from '../../ipc/worker/index'

export class ClosureWorker extends Worker<Request.Map, Response.Map> {
	constructor() {
		getSocketPath()

		super(require.resolve('./launcher'))
	}
}

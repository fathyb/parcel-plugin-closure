import {Request, Response} from '../../interfaces'
import {Handler} from '../../ipc'

import {Bridge} from '../index'

const bridge = new Bridge()

const handler: Handler<Request, Response> = {
	addBundle(bundle) {
		return bridge.addBundle(bundle)
	},
	addFile(file) {
		return bridge.addFile(file)
	}
}

export = handler

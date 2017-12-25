import {Server as HTTPServer} from 'http'

import bodyParser = require('body-parser')
import express = require('express')

import {Bridge} from '../compiler'
import {getSocketPath} from './dynamic'
import {Request, Response} from './protocol'

// just an alias to type-check the request->response mapping
function respond<K extends keyof Request.Map>(
	body: Request.Map[K], res: express.Response, response: Response.Map[K]
): void {
	if(!body) {
		throw new Error('invariant: body should not be null')
	}

	res.json({response})
}

export class Server {
	private readonly app = express()
	private readonly bridge = new Bridge()
	private readonly server: HTTPServer

	private listening = false

	constructor() {
		this.server = this.app
			.use(bodyParser.json({limit: '10mb'}))
			.post('/addBundle', this.addBundle)
			.post('/addFile', this.addFile)
			.listen(getSocketPath(), () => this.listening = true)
			.on('error', err => console.error(err))
	}

	public close() {
		this.server.close()
	}

	private readonly addBundle = async (req: express.Request, res: express.Response) => {
		const body = req.body as Request.AddBundle

		try {
			await this.bridge.addBundle(body.bundle)
		}
		catch(error) {
			console.error(error)

			res.json({error})

			return
		}

		respond(body, res, undefined)
	}

	private readonly addFile = async (req: express.Request, res: express.Response) => {
		const body = req.body as Request.AddFile

		try {
			await this.bridge.addFile(body.path, body.contents, body.packageFile)
		}
		catch(error) {
			console.error(error)

			res.json({error})

			return
		}

		respond(body, res, undefined)
	}
}

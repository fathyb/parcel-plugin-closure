import {Server as HTTPServer} from 'http'

import bodyParser = require('body-parser')
import express = require('express')

import {setSocketPath} from './dynamic'
import {getHandlerMethods, Handler} from './handler'

export class Server<RQ, RS> {
	private readonly app = express()
	private readonly server: HTTPServer

	private listening = false

	constructor(handler: Handler<RQ, RS>) {
		const app = this.app.use(bodyParser.json({limit: '1000mb'}))

		getHandlerMethods(handler).forEach(method =>
			app.post(`/${method}`, async (req, res) => {
				try {
					const result = await handler[method](req.body)

					res.json({result})
				}
				catch(error) {
					const message = error && (error.message || error)

					res.json({
						error: (typeof message === 'string' && message) || 'Unknown error'
					})

					return
				}
			})
		)

		this.server = app
			.listen(setSocketPath(), () => this.listening = true)
			.on('error', err => {
				console.error('server error', err)

				process.exit(2)
			})
	}

	public close() {
		this.server.close()
	}
}

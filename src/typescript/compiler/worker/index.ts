import {HandlerMethod, Server, Worker} from '../../ipc'

import {Bundle, ProcessedFile, Request, Response} from '../../interfaces'

export class ClosureWorker extends Worker<Request, Response> {
	constructor() {
		super(require.resolve('./launcher'))
	}

	@HandlerMethod
	public addBundle(bundle: Bundle) {
		return this.request('addBundle', bundle)
	}

	@HandlerMethod
	public addFile(file: ProcessedFile) {
		return this.request('addFile', file)
	}
}

export class ClosureServer extends Server<Request, Response> {
	private readonly worker: ClosureWorker

	constructor() {
		const worker = new ClosureWorker()

		super(worker)

		this.worker = worker
	}

	public close() {
		this.worker.kill()

		super.close()
	}
}

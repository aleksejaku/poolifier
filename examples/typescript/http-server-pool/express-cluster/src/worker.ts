import type { Server } from 'http'
import type { AddressInfo } from 'net'
import { ClusterWorker } from 'poolifier'
import express, { type Express, type Request, type Response } from 'express'
import { type WorkerData, type WorkerResponse } from './types.js'

const factorial: (n: number) => number = (n) => {
  if (n === 0) {
    return 1
  }
  return factorial(n - 1) * n
}

class ExpressWorker extends ClusterWorker<WorkerData, WorkerResponse> {
  private static server: Server

  private static readonly startExpress = (
    workerData?: WorkerData
  ): WorkerResponse => {
    const application: Express = express()

    // Parse only JSON requests body
    application.use(express.json())

    application.all('/api/echo', (req: Request, res: Response) => {
      res.send(req.body).end()
    })

    application.get('/api/factorial/:number', (req: Request, res: Response) => {
      const { number } = req.params
      res.send({ number: factorial(parseInt(number)) }).end()
    })

    ExpressWorker.server = application.listen(workerData?.port, () => {
      console.info(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `⚡️[express server]: Express server is started in cluster worker at http://localhost:${workerData?.port}/`
      )
    })
    return {
      status: true,
      port:
        (ExpressWorker.server.address() as AddressInfo)?.port ??
        workerData?.port
    }
  }

  public constructor () {
    super(ExpressWorker.startExpress, {
      killHandler: () => {
        ExpressWorker.server.close()
      }
    })
  }
}

export const expressWorker = new ExpressWorker()

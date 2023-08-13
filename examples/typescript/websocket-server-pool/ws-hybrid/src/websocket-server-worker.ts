import {
  ClusterWorker,
  DynamicThreadPool,
  availableParallelism
} from 'poolifier'
import { type RawData, WebSocketServer } from 'ws'
import {
  type ClusterWorkerData,
  type ClusterWorkerResponse,
  type DataPayload,
  type MessagePayload,
  MessageType,
  type ThreadWorkerData,
  type ThreadWorkerResponse
} from './types.js'

const emptyFunction = (): void => {
  /** Intentional */
}

class WebSocketServerWorker extends ClusterWorker<
ClusterWorkerData,
ClusterWorkerResponse
> {
  private static readonly startWebSocketServer = (
    workerData?: ClusterWorkerData
  ): ClusterWorkerResponse => {
    const { port } = workerData as ClusterWorkerData
    const wss = new WebSocketServer({ port }, () => {
      console.info(
        `⚡️[ws server]: WebSocket server is started in cluster worker at ws://localhost:${port}/`
      )
    })

    WebSocketServerWorker.requestHandlerPool = new DynamicThreadPool<
    ThreadWorkerData<DataPayload>,
    ThreadWorkerResponse<DataPayload>
    >(
      workerData?.minWorkers ?? 1,
      workerData?.maxWorkers ?? availableParallelism(),
      workerData?.workerFile as string
    )

    wss.on('connection', ws => {
      ws.on('error', console.error)
      ws.on('message', (message: RawData) => {
        const { type, data } = JSON.parse(
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          message.toString()
        ) as MessagePayload<DataPayload>
        switch (type) {
          case MessageType.echo:
            WebSocketServerWorker.requestHandlerPool
              .execute({ data }, 'echo')
              .then(response => {
                ws.send(
                  JSON.stringify({
                    type: MessageType.echo,
                    data: response.data
                  })
                )
                return null
              })
              .catch(emptyFunction)
            break
          case MessageType.factorial:
            WebSocketServerWorker.requestHandlerPool
              .execute({ data }, 'factorial')
              .then(response => {
                ws.send(
                  JSON.stringify({
                    type: MessageType.factorial,
                    data: response.data
                  })
                )
                return null
              })
              .catch(emptyFunction)
            break
        }
      })
    })
    return {
      status: true,
      port: wss.options.port
    }
  }

  private static requestHandlerPool: DynamicThreadPool<
  ThreadWorkerData<DataPayload>,
  ThreadWorkerResponse<DataPayload>
  >

  public constructor () {
    super(WebSocketServerWorker.startWebSocketServer)
  }
}

export const webSocketServerWorker = new WebSocketServerWorker()

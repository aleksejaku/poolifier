import { DEFAULT_WORKER_CHOICE_STRATEGY_OPTIONS } from '../../utils'
import type { IPool } from '../pool'
import type { IWorker } from '../worker'
import { AbstractWorkerChoiceStrategy } from './abstract-worker-choice-strategy'
import type {
  IWorkerChoiceStrategy,
  WorkerChoiceStrategyOptions
} from './selection-strategies-types'

/**
 * Selects the least used worker.
 *
 * @typeParam Worker - Type of worker which manages the strategy.
 * @typeParam Data - Type of data sent to the worker. This can only be structured-cloneable data.
 * @typeParam Response - Type of execution response. This can only be structured-cloneable data.
 */
export class LeastUsedWorkerChoiceStrategy<
    Worker extends IWorker,
    Data = unknown,
    Response = unknown
  >
  extends AbstractWorkerChoiceStrategy<Worker, Data, Response>
  implements IWorkerChoiceStrategy {
  /** @inheritDoc */
  public constructor (
    pool: IPool<Worker, Data, Response>,
    opts: WorkerChoiceStrategyOptions = DEFAULT_WORKER_CHOICE_STRATEGY_OPTIONS
  ) {
    super(pool, opts)
    this.setTaskStatisticsRequirements(this.opts)
  }

  /** @inheritDoc */
  public reset (): boolean {
    return true
  }

  /** @inheritDoc */
  public update (): boolean {
    return true
  }

  /** @inheritDoc */
  public choose (): number | undefined {
    this.setPreviousWorkerNodeKey(this.nextWorkerNodeKey)
    this.nextWorkerNodeKey = this.leastUsedNextWorkerNodeKey()
    return this.nextWorkerNodeKey
  }

  /** @inheritDoc */
  public remove (): boolean {
    return true
  }

  private leastUsedNextWorkerNodeKey (): number | undefined {
    return this.pool.workerNodes.reduce(
      (minWorkerNodeKey, workerNode, workerNodeKey, workerNodes) => {
        return workerNode.usage.tasks.executed +
          workerNode.usage.tasks.executing +
          workerNode.usage.tasks.queued <
          workerNodes[minWorkerNodeKey].usage.tasks.executed +
            workerNodes[minWorkerNodeKey].usage.tasks.executing +
            workerNodes[minWorkerNodeKey].usage.tasks.queued
          ? workerNodeKey
          : minWorkerNodeKey
      },
      0
    )
  }
}

import { DEFAULT_WORKER_CHOICE_STRATEGY_OPTIONS } from '../../utils'
import { PoolType, type IPool } from '../pool'
import type { IWorker } from '../worker'
import type {
  IWorkerChoiceStrategy,
  RequiredStatistics,
  WorkerChoiceStrategyOptions
} from './selection-strategies-types'

/**
 * Worker choice strategy abstract base class.
 *
 * @typeParam Worker - Type of worker which manages the strategy.
 * @typeParam Data - Type of data sent to the worker. This can only be serializable data.
 * @typeParam Response - Type of execution response. This can only be serializable data.
 */
export abstract class AbstractWorkerChoiceStrategy<
  Worker extends IWorker,
  Data = unknown,
  Response = unknown
> implements IWorkerChoiceStrategy {
  /**
   * Toggles finding the last free worker node key.
   */
  private toggleFindLastFreeWorkerNodeKey: boolean = false
  /** @inheritDoc */
  protected readonly isDynamicPool: boolean
  /** @inheritDoc */
  public readonly requiredStatistics: RequiredStatistics = {
    runTime: false,
    avgRunTime: false,
    medRunTime: false
  }

  /**
   * Constructs a worker choice strategy bound to the pool.
   *
   * @param pool - The pool instance.
   * @param opts - The worker choice strategy options.
   */
  public constructor (
    protected readonly pool: IPool<Worker, Data, Response>,
    protected opts: WorkerChoiceStrategyOptions = DEFAULT_WORKER_CHOICE_STRATEGY_OPTIONS
  ) {
    this.isDynamicPool = this.pool.type === PoolType.DYNAMIC
    this.choose = this.choose.bind(this)
  }

  protected checkOptions (opts: WorkerChoiceStrategyOptions): void {
    if (this.requiredStatistics.avgRunTime && opts.medRunTime === true) {
      this.requiredStatistics.avgRunTime = false
      this.requiredStatistics.medRunTime = opts.medRunTime as boolean
    }
    if (this.requiredStatistics.medRunTime && opts.medRunTime === false) {
      this.requiredStatistics.avgRunTime = true
      this.requiredStatistics.medRunTime = opts.medRunTime as boolean
    }
  }

  /** @inheritDoc */
  public abstract reset (): boolean

  /** @inheritDoc */
  public abstract choose (): number

  /** @inheritDoc */
  public abstract remove (workerNodeKey: number): boolean

  /** @inheritDoc */
  public setOptions (opts: WorkerChoiceStrategyOptions): void {
    opts = opts ?? DEFAULT_WORKER_CHOICE_STRATEGY_OPTIONS
    this.checkOptions(opts)
    this.opts = opts
  }

  /**
   * Finds a free worker node key.
   *
   * @returns The free worker node key or `-1` if there is no free worker node.
   */
  protected findFreeWorkerNodeKey (): number {
    if (this.toggleFindLastFreeWorkerNodeKey) {
      this.toggleFindLastFreeWorkerNodeKey = false
      return this.findLastFreeWorkerNodeKey()
    }
    this.toggleFindLastFreeWorkerNodeKey = true
    return this.findFirstFreeWorkerNodeKey()
  }

  /**
   * Finds the first free worker node key based on the number of tasks the worker has applied.
   *
   * If a worker is found with `0` running tasks, it is detected as free and its worker node key is returned.
   *
   * If no free worker is found, `-1` is returned.
   *
   * @returns A worker node key if there is one, `-1` otherwise.
   */
  private findFirstFreeWorkerNodeKey (): number {
    return this.pool.workerNodes.findIndex(workerNode => {
      return workerNode.tasksUsage?.running === 0
    })
  }

  /**
   * Finds the last free worker node key based on the number of tasks the worker has applied.
   *
   * If a worker is found with `0` running tasks, it is detected as free and its worker node key is returned.
   *
   * If no free worker is found, `-1` is returned.
   *
   * @returns A worker node key if there is one, `-1` otherwise.
   */
  private findLastFreeWorkerNodeKey (): number {
    // It requires node >= 18.0.0:
    // return this.workerNodes.findLastIndex(workerNode => {
    //   return workerNode.tasksUsage?.running === 0
    // })
    for (let i = this.pool.workerNodes.length - 1; i >= 0; i--) {
      if (this.pool.workerNodes[i].tasksUsage?.running === 0) {
        return i
      }
    }
    return -1
  }
}

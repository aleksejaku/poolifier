import { isMainThread } from 'node:worker_threads'
import { ThreadWorker } from '../../lib/index.mjs'
import { executeTaskFunction } from '../benchmarks-utils.mjs'
import { TaskFunctions } from '../benchmarks-types.mjs'

const debug = false

const taskFunction = data => {
  data = data || {}
  data.function = data.function || TaskFunctions.jsonIntegerSerialization
  const res = executeTaskFunction(data)
  debug === true && console.debug(`This is the main thread ${isMainThread}`)
  return res
}

export default new ThreadWorker(taskFunction)

'use strict'
const { isMainThread } = require('worker_threads')
const { ThreadWorker, KillBehaviors } = require('../../../lib')
const TestUtils = require('../../test-utils')
const { WorkerFunctions } = require('../../test-types')

function test (data) {
  data = data || {}
  data.function = data.function || WorkerFunctions.jsonIntegerSerialization
  TestUtils.executeWorkerFunction(data)
  return isMainThread
}

module.exports = new ThreadWorker(test, {
  maxInactiveTime: 500,
  killBehavior: KillBehaviors.HARD
})

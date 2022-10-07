'use strict'
const { ClusterWorker, KillBehaviors } = require('../../../lib/index')
const { isMaster } = require('cluster')
const TestUtils = require('../../test-utils')

function test (data) {
  TestUtils.jsonIntegerSerialization(50)
  return isMaster
}

module.exports = new ClusterWorker(test, {
  maxInactiveTime: 500,
  killBehavior: KillBehaviors.HARD
})

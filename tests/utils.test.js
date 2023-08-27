const { randomInt } = require('crypto')
const { Worker } = require('worker_threads')
const cluster = require('cluster')
const { expect } = require('expect')
const {
  CircularArray,
  DEFAULT_CIRCULAR_ARRAY_SIZE
} = require('../lib/circular-array')
const {
  availableParallelism,
  average,
  exponentialDelay,
  getWorkerType,
  getWorkerId,
  isAsyncFunction,
  isKillBehavior,
  isPlainObject,
  median,
  round,
  secureRandom,
  sleep,
  updateMeasurementStatistics
} = require('../lib/utils')
const { KillBehaviors, WorkerTypes } = require('../lib')

describe('Utils test suite', () => {
  it('Verify availableParallelism() behavior', () => {
    const parallelism = availableParallelism()
    expect(typeof parallelism === 'number').toBe(true)
    expect(parallelism).toBeGreaterThan(0)
    expect(Number.isSafeInteger(parallelism)).toBe(true)
  })

  it('Verify getWorkerType() behavior', () => {
    expect(
      getWorkerType(new Worker('./tests/worker-files/thread/testWorker.js'))
    ).toBe(WorkerTypes.thread)
    expect(getWorkerType(cluster.fork())).toBe(WorkerTypes.cluster)
  })

  it('Verify getWorkerId() behavior', () => {
    const threadWorker = new Worker('./tests/worker-files/thread/testWorker.js')
    const clusterWorker = cluster.fork()
    expect(getWorkerId(threadWorker)).toBe(threadWorker.threadId)
    expect(getWorkerId(clusterWorker)).toBe(clusterWorker.id)
  })

  it.skip('Verify sleep() behavior', async () => {
    const start = performance.now()
    await sleep(1000)
    const elapsed = performance.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(1000)
  })

  it('Verify exponentialDelay() behavior', () => {
    const delay = exponentialDelay(randomInt(1000))
    expect(typeof delay === 'number').toBe(true)
    expect(delay).toBeGreaterThanOrEqual(Number.MIN_VALUE)
    expect(delay).toBeLessThanOrEqual(Number.MAX_VALUE)
  })

  it('Verify average() computation', () => {
    expect(average([])).toBe(0)
    expect(average([0.08])).toBe(0.08)
    expect(average([0.25, 4.75, 3.05, 6.04, 1.01, 2.02, 5.03])).toBe(
      3.1642857142857146
    )
    expect(average([0.25, 4.75, 3.05, 6.04, 1.01, 2.02])).toBe(
      2.8533333333333335
    )
  })

  it('Verify median() computation', () => {
    expect(median([])).toBe(0)
    expect(median([0.08])).toBe(0.08)
    expect(median([0.25, 4.75, 3.05, 6.04, 1.01, 2.02, 5.03])).toBe(3.05)
    expect(median([0.25, 4.75, 3.05, 6.04, 1.01, 2.02])).toBe(2.535)
  })

  it('Verify round() behavior', () => {
    expect(round(0)).toBe(0)
    expect(round(0.5, 0)).toBe(1)
    expect(round(0.5)).toBe(0.5)
    expect(round(-0.5, 0)).toBe(-1)
    expect(round(-0.5)).toBe(-0.5)
    expect(round(1.005)).toBe(1.01)
    expect(round(2.175)).toBe(2.18)
    expect(round(5.015)).toBe(5.02)
    expect(round(-1.005)).toBe(-1.01)
    expect(round(-2.175)).toBe(-2.18)
    expect(round(-5.015)).toBe(-5.02)
  })

  it('Verify isPlainObject() behavior', () => {
    expect(isPlainObject(null)).toBe(false)
    expect(isPlainObject(undefined)).toBe(false)
    expect(isPlainObject(true)).toBe(false)
    expect(isPlainObject(false)).toBe(false)
    expect(isPlainObject(0)).toBe(false)
    expect(isPlainObject('')).toBe(false)
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject(() => {})).toBe(false)
    expect(isPlainObject(new Date())).toBe(false)
    expect(isPlainObject(new RegExp())).toBe(false)
    expect(isPlainObject(new Error())).toBe(false)
    expect(isPlainObject(new Map())).toBe(false)
    expect(isPlainObject(new Set())).toBe(false)
    expect(isPlainObject(new WeakMap())).toBe(false)
    expect(isPlainObject(new WeakSet())).toBe(false)
    expect(isPlainObject(new Int8Array())).toBe(false)
    expect(isPlainObject(new Uint8Array())).toBe(false)
    expect(isPlainObject(new Uint8ClampedArray())).toBe(false)
    expect(isPlainObject(new Int16Array())).toBe(false)
    expect(isPlainObject(new Uint16Array())).toBe(false)
    expect(isPlainObject(new Int32Array())).toBe(false)
    expect(isPlainObject(new Uint32Array())).toBe(false)
    expect(isPlainObject(new Float32Array())).toBe(false)
    expect(isPlainObject(new Float64Array())).toBe(false)
    expect(isPlainObject(new BigInt64Array())).toBe(false)
    expect(isPlainObject(new BigUint64Array())).toBe(false)
    expect(isPlainObject(new Promise(() => {}))).toBe(false)
    expect(isPlainObject(new WeakRef({}))).toBe(false)
    expect(isPlainObject(new FinalizationRegistry(() => {}))).toBe(false)
    expect(isPlainObject(new ArrayBuffer())).toBe(false)
    expect(isPlainObject(new SharedArrayBuffer())).toBe(false)
    expect(isPlainObject(new DataView(new ArrayBuffer()))).toBe(false)
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject({ a: 1 })).toBe(true)
  })

  it('Verify isKillBehavior() behavior', () => {
    expect(isKillBehavior(KillBehaviors.SOFT, KillBehaviors.SOFT)).toBe(true)
    expect(isKillBehavior(KillBehaviors.SOFT, KillBehaviors.HARD)).toBe(false)
    expect(isKillBehavior(KillBehaviors.HARD, KillBehaviors.HARD)).toBe(true)
    expect(isKillBehavior(KillBehaviors.HARD, KillBehaviors.SOFT)).toBe(false)
    expect(isKillBehavior(KillBehaviors.SOFT)).toBe(false)
    expect(isKillBehavior(KillBehaviors.HARD)).toBe(false)
    expect(isKillBehavior(KillBehaviors.HARD, null)).toBe(false)
    expect(isKillBehavior(KillBehaviors.HARD, undefined)).toBe(false)
    expect(isKillBehavior(KillBehaviors.SOFT, 'unknown')).toBe(false)
  })

  it('Verify isAsyncFunction() behavior', () => {
    expect(isAsyncFunction(null)).toBe(false)
    expect(isAsyncFunction(undefined)).toBe(false)
    expect(isAsyncFunction(true)).toBe(false)
    expect(isAsyncFunction(false)).toBe(false)
    expect(isAsyncFunction(0)).toBe(false)
    expect(isAsyncFunction('')).toBe(false)
    expect(isAsyncFunction([])).toBe(false)
    expect(isAsyncFunction(new Date())).toBe(false)
    expect(isAsyncFunction(new RegExp())).toBe(false)
    expect(isAsyncFunction(new Error())).toBe(false)
    expect(isAsyncFunction(new Map())).toBe(false)
    expect(isAsyncFunction(new Set())).toBe(false)
    expect(isAsyncFunction(new WeakMap())).toBe(false)
    expect(isAsyncFunction(new WeakSet())).toBe(false)
    expect(isAsyncFunction(new Int8Array())).toBe(false)
    expect(isAsyncFunction(new Uint8Array())).toBe(false)
    expect(isAsyncFunction(new Uint8ClampedArray())).toBe(false)
    expect(isAsyncFunction(new Int16Array())).toBe(false)
    expect(isAsyncFunction(new Uint16Array())).toBe(false)
    expect(isAsyncFunction(new Int32Array())).toBe(false)
    expect(isAsyncFunction(new Uint32Array())).toBe(false)
    expect(isAsyncFunction(new Float32Array())).toBe(false)
    expect(isAsyncFunction(new Float64Array())).toBe(false)
    expect(isAsyncFunction(new BigInt64Array())).toBe(false)
    expect(isAsyncFunction(new BigUint64Array())).toBe(false)
    expect(isAsyncFunction(new Promise(() => {}))).toBe(false)
    expect(isAsyncFunction(new WeakRef({}))).toBe(false)
    expect(isAsyncFunction(new FinalizationRegistry(() => {}))).toBe(false)
    expect(isAsyncFunction(new ArrayBuffer())).toBe(false)
    expect(isAsyncFunction(new SharedArrayBuffer())).toBe(false)
    expect(isAsyncFunction(new DataView(new ArrayBuffer()))).toBe(false)
    expect(isAsyncFunction({})).toBe(false)
    expect(isAsyncFunction({ a: 1 })).toBe(false)
    expect(isAsyncFunction(() => {})).toBe(false)
    expect(isAsyncFunction(function () {})).toBe(false)
    expect(isAsyncFunction(function named () {})).toBe(false)
    expect(isAsyncFunction(async () => {})).toBe(true)
    expect(isAsyncFunction(async function () {})).toBe(true)
    expect(isAsyncFunction(async function named () {})).toBe(true)
  })

  it('Verify updateMeasurementStatistics() behavior', () => {
    const measurementStatistics = {
      history: new CircularArray()
    }
    updateMeasurementStatistics(
      measurementStatistics,
      { aggregate: true, average: false, median: false },
      0.01
    )
    expect(measurementStatistics).toStrictEqual({
      aggregate: 0.01,
      maximum: 0.01,
      minimum: 0.01,
      history: new CircularArray()
    })
    updateMeasurementStatistics(
      measurementStatistics,
      { aggregate: true, average: false, median: false },
      0.02
    )
    expect(measurementStatistics).toStrictEqual({
      aggregate: 0.03,
      maximum: 0.02,
      minimum: 0.01,
      history: new CircularArray()
    })
    updateMeasurementStatistics(
      measurementStatistics,
      { aggregate: true, average: true, median: false },
      0.001
    )
    expect(measurementStatistics).toStrictEqual({
      aggregate: 0.031,
      maximum: 0.02,
      minimum: 0.001,
      average: 0.001,
      history: new CircularArray(DEFAULT_CIRCULAR_ARRAY_SIZE, 0.001)
    })
    updateMeasurementStatistics(
      measurementStatistics,
      { aggregate: true, average: true, median: false },
      0.003
    )
    expect(measurementStatistics).toStrictEqual({
      aggregate: 0.034,
      maximum: 0.02,
      minimum: 0.001,
      average: 0.002,
      history: new CircularArray(DEFAULT_CIRCULAR_ARRAY_SIZE, 0.001, 0.003)
    })
    updateMeasurementStatistics(
      measurementStatistics,
      { aggregate: true, average: false, median: true },
      0.006
    )
    expect(measurementStatistics).toStrictEqual({
      aggregate: 0.04,
      maximum: 0.02,
      minimum: 0.001,
      median: 0.003,
      history: new CircularArray(
        DEFAULT_CIRCULAR_ARRAY_SIZE,
        0.001,
        0.003,
        0.006
      )
    })
    updateMeasurementStatistics(
      measurementStatistics,
      { aggregate: true, average: true, median: false },
      0.01
    )
    expect(measurementStatistics).toStrictEqual({
      aggregate: 0.05,
      maximum: 0.02,
      minimum: 0.001,
      average: 0.005,
      history: new CircularArray(
        DEFAULT_CIRCULAR_ARRAY_SIZE,
        0.001,
        0.003,
        0.006,
        0.01
      )
    })
  })

  it('Verify secureRandom() behavior', () => {
    const randomNumber = secureRandom()
    expect(typeof randomNumber === 'number').toBe(true)
    expect(randomNumber).toBeGreaterThanOrEqual(0)
    expect(randomNumber).toBeLessThan(1)
  })
})

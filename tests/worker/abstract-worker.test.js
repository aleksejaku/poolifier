const { expect } = require('expect')
const sinon = require('sinon')
const { ClusterWorker, KillBehaviors, ThreadWorker } = require('../../lib')
const { DEFAULT_TASK_NAME, EMPTY_FUNCTION } = require('../../lib/utils')

describe('Abstract worker test suite', () => {
  class StubWorkerWithMainWorker extends ThreadWorker {
    constructor (fn, opts) {
      super(fn, opts)
      this.mainWorker = undefined
    }
  }

  afterEach(() => {
    sinon.restore()
  })

  it('Verify worker options default values', () => {
    const worker = new ThreadWorker(() => {})
    expect(worker.opts).toStrictEqual({
      killBehavior: KillBehaviors.SOFT,
      maxInactiveTime: 60000,
      killHandler: EMPTY_FUNCTION
    })
  })

  it('Verify that worker options are set at worker creation', () => {
    const killHandler = () => {
      console.info('Worker received kill message')
    }
    const worker = new ClusterWorker(() => {}, {
      killBehavior: KillBehaviors.HARD,
      maxInactiveTime: 6000,
      killHandler,
      async: true
    })
    expect(worker.opts).toStrictEqual({
      killBehavior: KillBehaviors.HARD,
      maxInactiveTime: 6000,
      killHandler
    })
  })

  it('Verify that taskFunctions parameter is mandatory', () => {
    expect(() => new ClusterWorker()).toThrowError(
      'taskFunctions parameter is mandatory'
    )
  })

  it('Verify that taskFunctions parameter is a function or a plain object', () => {
    expect(() => new ClusterWorker(0)).toThrowError(
      new TypeError(
        'taskFunctions parameter is not a function or a plain object'
      )
    )
    expect(() => new ClusterWorker('')).toThrowError(
      new TypeError(
        'taskFunctions parameter is not a function or a plain object'
      )
    )
    expect(() => new ClusterWorker(true)).toThrowError(
      new TypeError(
        'taskFunctions parameter is not a function or a plain object'
      )
    )
    expect(() => new ClusterWorker([])).toThrowError(
      new TypeError(
        'taskFunctions parameter is not a function or a plain object'
      )
    )
    expect(() => new ClusterWorker(new Map())).toThrowError(
      new TypeError(
        'taskFunctions parameter is not a function or a plain object'
      )
    )
    expect(() => new ClusterWorker(new Set())).toThrowError(
      new TypeError(
        'taskFunctions parameter is not a function or a plain object'
      )
    )
    expect(() => new ClusterWorker(new WeakMap())).toThrowError(
      new TypeError(
        'taskFunctions parameter is not a function or a plain object'
      )
    )
    expect(() => new ClusterWorker(new WeakSet())).toThrowError(
      new TypeError(
        'taskFunctions parameter is not a function or a plain object'
      )
    )
  })

  it('Verify that taskFunctions parameter is not an empty object', () => {
    expect(() => new ClusterWorker({})).toThrowError(
      new Error('taskFunctions parameter object is empty')
    )
  })

  it('Verify that taskFunctions parameter with unique function is taken', () => {
    const worker = new ThreadWorker(() => {})
    expect(worker.taskFunctions.get(DEFAULT_TASK_NAME)).toBeInstanceOf(Function)
    expect(worker.taskFunctions.get('fn1')).toBeInstanceOf(Function)
    expect(worker.taskFunctions.size).toBe(2)
    expect(worker.taskFunctions.get(DEFAULT_TASK_NAME)).toStrictEqual(
      worker.taskFunctions.get('fn1')
    )
  })

  it('Verify that taskFunctions parameter with multiple task functions is checked', () => {
    const fn1 = () => {
      return 1
    }
    const fn2 = ''
    expect(() => new ThreadWorker({ '': fn1 })).toThrowError(
      new TypeError('A taskFunctions parameter object key is an empty string')
    )
    expect(() => new ThreadWorker({ fn1, fn2 })).toThrowError(
      new TypeError('A taskFunctions parameter object value is not a function')
    )
  })

  it('Verify that taskFunctions parameter with multiple task functions is taken', () => {
    const fn1 = () => {
      return 1
    }
    const fn2 = () => {
      return 2
    }
    const worker = new ClusterWorker({ fn1, fn2 })
    expect(worker.taskFunctions.get(DEFAULT_TASK_NAME)).toBeInstanceOf(Function)
    expect(worker.taskFunctions.get('fn1')).toBeInstanceOf(Function)
    expect(worker.taskFunctions.get('fn2')).toBeInstanceOf(Function)
    expect(worker.taskFunctions.size).toBe(3)
    expect(worker.taskFunctions.get(DEFAULT_TASK_NAME)).toStrictEqual(
      worker.taskFunctions.get('fn1')
    )
  })

  it('Verify that sync kill handler is called when worker is killed', () => {
    const worker = new ClusterWorker(() => {}, {
      killHandler: sinon.stub().returns()
    })
    worker.isMain = false
    worker.getMainWorker = sinon.stub().returns({
      id: 1,
      send: sinon.stub().returns()
    })
    worker.handleKillMessage()
    expect(worker.getMainWorker().send.calledOnce).toBe(true)
    expect(worker.opts.killHandler.calledOnce).toBe(true)
  })

  it('Verify that async kill handler is called when worker is killed', () => {
    const killHandlerStub = sinon.stub().returns()
    const worker = new ClusterWorker(() => {}, {
      killHandler: async () => Promise.resolve(killHandlerStub())
    })
    worker.isMain = false
    worker.handleKillMessage()
    expect(killHandlerStub.calledOnce).toBe(true)
  })

  it('Verify that handleError() method works properly', () => {
    const error = new Error('Error as an error')
    const worker = new ClusterWorker(() => {})
    expect(worker.handleError(error)).not.toBeInstanceOf(Error)
    expect(worker.handleError(error)).toStrictEqual(error.message)
    const errorMessage = 'Error as a string'
    expect(worker.handleError(errorMessage)).toStrictEqual(errorMessage)
  })

  it('Verify that getMainWorker() throw error if main worker is not set', () => {
    expect(() =>
      new StubWorkerWithMainWorker(() => {}).getMainWorker()
    ).toThrowError('Main worker not set')
  })

  it('Verify that hasTaskFunction() works', () => {
    const fn1 = () => {
      return 1
    }
    const fn2 = () => {
      return 2
    }
    const worker = new ClusterWorker({ fn1, fn2 })
    expect(() => worker.hasTaskFunction(0)).toThrowError(
      new TypeError('name parameter is not a string')
    )
    expect(() => worker.hasTaskFunction('')).toThrowError(
      new TypeError('name parameter is an empty string')
    )
    expect(worker.hasTaskFunction(DEFAULT_TASK_NAME)).toBe(true)
    expect(worker.hasTaskFunction('fn1')).toBe(true)
    expect(worker.hasTaskFunction('fn2')).toBe(true)
    expect(worker.hasTaskFunction('fn3')).toBe(false)
  })

  it('Verify that addTaskFunction() works', () => {
    const fn1 = () => {
      return 1
    }
    const fn2 = () => {
      return 2
    }
    const fn1Replacement = () => {
      return 3
    }
    const worker = new ThreadWorker(fn1)
    expect(() => worker.addTaskFunction(0, fn1)).toThrowError(
      new TypeError('name parameter is not a string')
    )
    expect(() => worker.addTaskFunction('', fn1)).toThrowError(
      new TypeError('name parameter is an empty string')
    )
    expect(() => worker.addTaskFunction('fn3', '')).toThrowError(
      new TypeError('fn parameter is not a function')
    )
    expect(worker.taskFunctions.get(DEFAULT_TASK_NAME)).toBeInstanceOf(Function)
    expect(worker.taskFunctions.get('fn1')).toBeInstanceOf(Function)
    expect(worker.taskFunctions.size).toBe(2)
    expect(worker.taskFunctions.get(DEFAULT_TASK_NAME)).toStrictEqual(
      worker.taskFunctions.get('fn1')
    )
    expect(() => worker.addTaskFunction(DEFAULT_TASK_NAME, fn2)).toThrowError(
      new Error('Cannot add a task function with the default reserved name')
    )
    worker.addTaskFunction('fn2', fn2)
    expect(worker.taskFunctions.get(DEFAULT_TASK_NAME)).toBeInstanceOf(Function)
    expect(worker.taskFunctions.get('fn1')).toBeInstanceOf(Function)
    expect(worker.taskFunctions.get('fn2')).toBeInstanceOf(Function)
    expect(worker.taskFunctions.size).toBe(3)
    expect(worker.taskFunctions.get(DEFAULT_TASK_NAME)).toStrictEqual(
      worker.taskFunctions.get('fn1')
    )
    worker.addTaskFunction('fn1', fn1Replacement)
    expect(worker.taskFunctions.get(DEFAULT_TASK_NAME)).toBeInstanceOf(Function)
    expect(worker.taskFunctions.get('fn1')).toBeInstanceOf(Function)
    expect(worker.taskFunctions.get('fn2')).toBeInstanceOf(Function)
    expect(worker.taskFunctions.size).toBe(3)
    expect(worker.taskFunctions.get(DEFAULT_TASK_NAME)).toStrictEqual(
      worker.taskFunctions.get('fn1')
    )
  })

  it('Verify that removeTaskFunction() works', () => {
    const fn1 = () => {
      return 1
    }
    const fn2 = () => {
      return 2
    }
    const worker = new ClusterWorker({ fn1, fn2 })
    expect(() => worker.removeTaskFunction(0, fn1)).toThrowError(
      new TypeError('name parameter is not a string')
    )
    expect(() => worker.removeTaskFunction('', fn1)).toThrowError(
      new TypeError('name parameter is an empty string')
    )
    worker.getMainWorker = sinon.stub().returns({
      id: 1,
      send: sinon.stub().returns()
    })
    expect(worker.taskFunctions.get(DEFAULT_TASK_NAME)).toBeInstanceOf(Function)
    expect(worker.taskFunctions.get('fn1')).toBeInstanceOf(Function)
    expect(worker.taskFunctions.get('fn2')).toBeInstanceOf(Function)
    expect(worker.taskFunctions.size).toBe(3)
    expect(worker.taskFunctions.get(DEFAULT_TASK_NAME)).toStrictEqual(
      worker.taskFunctions.get('fn1')
    )
    expect(() => worker.removeTaskFunction(DEFAULT_TASK_NAME)).toThrowError(
      new Error(
        'Cannot remove the task function with the default reserved name'
      )
    )
    expect(() => worker.removeTaskFunction('fn1')).toThrowError(
      new Error(
        'Cannot remove the task function used as the default task function'
      )
    )
    worker.removeTaskFunction('fn2')
    expect(worker.taskFunctions.get(DEFAULT_TASK_NAME)).toBeInstanceOf(Function)
    expect(worker.taskFunctions.get('fn1')).toBeInstanceOf(Function)
    expect(worker.taskFunctions.get('fn2')).toBeUndefined()
    expect(worker.taskFunctions.size).toBe(2)
    expect(worker.getMainWorker().send.calledOnce).toBe(true)
  })

  it('Verify that listTaskFunctions() works', () => {
    const fn1 = () => {
      return 1
    }
    const fn2 = () => {
      return 2
    }
    const worker = new ClusterWorker({ fn1, fn2 })
    expect(worker.listTaskFunctions()).toStrictEqual([
      DEFAULT_TASK_NAME,
      'fn1',
      'fn2'
    ])
  })

  it('Verify that setDefaultTaskFunction() works', () => {
    const fn1 = () => {
      return 1
    }
    const fn2 = () => {
      return 2
    }
    const worker = new ThreadWorker({ fn1, fn2 })
    expect(() => worker.setDefaultTaskFunction(0, fn1)).toThrowError(
      new TypeError('name parameter is not a string')
    )
    expect(() => worker.setDefaultTaskFunction('', fn1)).toThrowError(
      new TypeError('name parameter is an empty string')
    )
    expect(worker.taskFunctions.get(DEFAULT_TASK_NAME)).toBeInstanceOf(Function)
    expect(worker.taskFunctions.get('fn1')).toBeInstanceOf(Function)
    expect(worker.taskFunctions.get('fn2')).toBeInstanceOf(Function)
    expect(worker.taskFunctions.size).toBe(3)
    expect(worker.taskFunctions.get(DEFAULT_TASK_NAME)).toStrictEqual(
      worker.taskFunctions.get('fn1')
    )
    expect(() => worker.setDefaultTaskFunction(DEFAULT_TASK_NAME)).toThrowError(
      new Error(
        'Cannot set the default task function reserved name as the default task function'
      )
    )
    expect(() => worker.setDefaultTaskFunction('fn3')).toThrowError(
      new Error(
        'Cannot set the default task function to a non-existing task function'
      )
    )
    worker.setDefaultTaskFunction('fn1')
    expect(worker.taskFunctions.get(DEFAULT_TASK_NAME)).toStrictEqual(
      worker.taskFunctions.get('fn1')
    )
    worker.setDefaultTaskFunction('fn2')
    expect(worker.taskFunctions.get(DEFAULT_TASK_NAME)).toStrictEqual(
      worker.taskFunctions.get('fn2')
    )
  })
})

import { expect } from 'expect'
import { Deque } from '../lib/deque.js'

describe('Deque test suite', () => {
  it('Verify push() behavior', () => {
    const deque = new Deque()
    let rtSize = deque.push(1)
    expect(deque.size).toBe(1)
    expect(deque.maxSize).toBe(1)
    expect(rtSize).toBe(deque.size)
    expect(deque.head).toMatchObject({ data: 1 })
    expect(deque.tail).toMatchObject({ data: 1 })
    rtSize = deque.push(2)
    expect(deque.size).toBe(2)
    expect(deque.maxSize).toBe(2)
    expect(rtSize).toBe(deque.size)
    expect(deque.head).toMatchObject({ data: 1 })
    expect(deque.tail).toMatchObject({ data: 2 })
    rtSize = deque.push(3)
    expect(deque.size).toBe(3)
    expect(deque.maxSize).toBe(3)
    expect(rtSize).toBe(deque.size)
    expect(deque.head).toMatchObject({ data: 1 })
    expect(deque.tail).toMatchObject({ data: 3 })
  })

  it('Verify unshift() behavior', () => {
    const deque = new Deque()
    let rtSize = deque.unshift(1)
    expect(deque.size).toBe(1)
    expect(deque.maxSize).toBe(1)
    expect(rtSize).toBe(deque.size)
    expect(deque.head).toMatchObject({ data: 1 })
    expect(deque.tail).toMatchObject({ data: 1 })
    rtSize = deque.unshift(2)
    expect(deque.size).toBe(2)
    expect(deque.maxSize).toBe(2)
    expect(rtSize).toBe(deque.size)
    expect(deque.head).toMatchObject({ data: 2 })
    expect(deque.tail).toMatchObject({ data: 1 })
    rtSize = deque.unshift(3)
    expect(deque.size).toBe(3)
    expect(deque.maxSize).toBe(3)
    expect(rtSize).toBe(deque.size)
    expect(deque.head).toMatchObject({ data: 3 })
    expect(deque.tail).toMatchObject({ data: 1 })
  })

  it('Verify pop() behavior', () => {
    const deque = new Deque()
    deque.push(1)
    deque.push(2)
    deque.push(3)
    let rtItem = deque.pop()
    expect(deque.size).toBe(2)
    expect(deque.maxSize).toBe(3)
    expect(rtItem).toBe(3)
    expect(deque.head).toMatchObject({ data: 1 })
    expect(deque.tail).toMatchObject({ data: 2 })
    rtItem = deque.pop()
    expect(deque.size).toBe(1)
    expect(deque.maxSize).toBe(3)
    expect(rtItem).toBe(2)
    expect(deque.head).toMatchObject({ data: 1 })
    expect(deque.tail).toMatchObject({ data: 1 })
    rtItem = deque.pop()
    expect(deque.size).toBe(0)
    expect(deque.maxSize).toBe(3)
    expect(rtItem).toBe(1)
    expect(deque.head).toBeUndefined()
    expect(deque.tail).toBeUndefined()
  })

  it('Verify shift() behavior', () => {
    const deque = new Deque()
    deque.push(1)
    deque.push(2)
    deque.push(3)
    let rtItem = deque.shift()
    expect(deque.size).toBe(2)
    expect(deque.maxSize).toBe(3)
    expect(rtItem).toBe(1)
    expect(deque.head).toMatchObject({ data: 2 })
    expect(deque.tail).toMatchObject({ data: 3 })
    rtItem = deque.shift()
    expect(deque.size).toBe(1)
    expect(deque.maxSize).toBe(3)
    expect(rtItem).toBe(2)
    expect(deque.head).toMatchObject({ data: 3 })
    expect(deque.tail).toMatchObject({ data: 3 })
    rtItem = deque.shift()
    expect(deque.size).toBe(0)
    expect(deque.maxSize).toBe(3)
    expect(rtItem).toBe(3)
    expect(deque.head).toBeUndefined()
    expect(deque.tail).toBeUndefined()
  })

  it('Verify peekFirst() behavior', () => {
    const deque = new Deque()
    deque.push(1)
    deque.push(2)
    deque.push(3)
    expect(deque.size).toBe(3)
    expect(deque.peekFirst()).toBe(1)
    expect(deque.size).toBe(3)
  })

  it('Verify peekLast() behavior', () => {
    const deque = new Deque()
    deque.push(1)
    deque.push(2)
    deque.push(3)
    expect(deque.size).toBe(3)
    expect(deque.peekLast()).toBe(3)
    expect(deque.size).toBe(3)
  })

  it('Verify clear() behavior', () => {
    const deque = new Deque()
    deque.push(1)
    deque.push(2)
    deque.push(3)
    expect(deque.size).toBe(3)
    expect(deque.maxSize).toBe(3)
    expect(deque.head).toMatchObject({ data: 1 })
    expect(deque.tail).toMatchObject({ data: 3 })
    deque.clear()
    expect(deque.size).toBe(0)
    expect(deque.maxSize).toBe(0)
    expect(deque.head).toBeUndefined()
    expect(deque.tail).toBeUndefined()
  })

  it('Verify iterator behavior', () => {
    const deque = new Deque()
    deque.push(1)
    deque.push(2)
    deque.push(3)
    let i = 1
    for (const value of deque) {
      expect(value).toBe(i)
      ++i
    }
  })

  it('Verify backward() iterator behavior', () => {
    const deque = new Deque()
    deque.push(1)
    deque.push(2)
    deque.push(3)
    let i = deque.size
    for (const value of deque.backward()) {
      expect(value).toBe(i)
      --i
    }
  })
})

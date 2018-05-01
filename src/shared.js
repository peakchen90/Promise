// @flow
import Promise from './Promise'

// 保存 setTimeout 方法的引用，防止被其他框架更改
const setTimeoutFn: Function = setTimeout

// Promise 状态常量
export const PENDING: State = 'pending'
export const FULFILLED: State = 'fulfilled'
export const REJECTED: State = 'rejected'

// 空操作函数
export function noop() {
}

// Deferred 类，用来分发处理 onFulfilled/onRejected
export class Deferred {
  onFulfilled: Function
  onRejected: Function
  promise: Promise

  constructor(onFulfilled: ?Function, onRejected: ?Function, promise: Promise) {
    // https://promisesaplus.com/#point-23
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : reason => {
      throw reason
    }
    this.onFulfilled = onFulfilled
    this.onRejected = onRejected
    this.promise = promise
  }
}

// 执行解析 Promise
export function doResolve(executor: Function, promise: Promise): void {
  // 确保 resolvePromise 或 rejectPromise 或 抛出异常只会调用一次，后续的会被忽略
  let called = false
  try {
    executor(value => {
      if (called) return
      called = true
      handleResolve(promise, value)
    }, reason => {
      if (called) return
      called = true
      handleReject(promise, reason)
    })
  } catch (e) {
    if (called) return
    called = true
    handleReject(promise, e)
  }
}

// 处理 Promise resolve
// https://promisesaplus.com/#the-promise-resolution-procedure
export function handleResolve(promise: Promise, x?: any): void {
  if (promise === x) {
    throw new TypeError('A promise cannot be resolved with itself.')
  }

  if (x instanceof Promise) {
    // https://promisesaplus.com/#point-49
    if (x._state === PENDING) {
      promise._hasPending = true
      handleResolve(promise, x)
    } else if (x._state === FULFILLED) {
      promise._state = FULFILLED
      promise._value = x._value
    } else if (x._state === REJECTED) {
      promise._state = REJECTED
      promise._value = x._value
    }

  } else if ((x !== null && x instanceof Object) || typeof x === 'function') {
    // https://promisesaplus.com/#point-53
    let then = x.then
    if (typeof then === 'function') {
      doResolve(then.bind(x), promise)
    } else {
      // https://promisesaplus.com/#point-63
      promise._state = FULFILLED
      promise._value = x
      finale(promise)
    }

  } else {
    // https://promisesaplus.com/#point-64
    promise._state = FULFILLED
    promise._value = x
    finale(promise)
  }
}

// 处理 Promise reject
export function handleReject(promise: Promise, reason: any): void {
  promise._state = REJECTED
  promise._value = reason
  finale(promise)
}

// 处理延迟代码（注册的then、catch、finally）
export function handleDeferred(promise: Promise, deferred: Deferred): void {
  // resolve(x) x为一个 Promise 时，等待此 Promise resolve 或 reject
  if (promise._hasPending) {
    handleDeferred(promise, deferred)
    return
  }

  //  Promise.then 注册后，Promise 的状态如果为 Pending，则加入延迟队列
  if (promise._state === PENDING) {
    promise._deferreds.push(deferred)
    return
  }

  promise._handled = true
  asyncFn(() => {
    const fn = promise._state === FULFILLED ? deferred.onFulfilled : deferred.onRejected
    try {
      handleResolve(deferred.promise, fn(promise._value))
    } catch (e) {
      handleReject(deferred.promise, e)
    }
  })
}

// 最后执行
export function finale(promise: Promise): void {
  if (promise._state === REJECTED && promise._deferreds.length === 0) {
    asyncFn(() => {
      if (!promise._handled) {
        unhandledRejectionFn(promise)
      }
    })
  }

  promise._deferreds.forEach(deferred => {
    handleDeferred(promise, deferred)
  })
  promise._deferreds = []
}

export function unhandledRejectionFn(error: any): void {
  if (console != null) {
    console.warn('Uncaught (in promise)', error)
  }
}

// 平台异步调用方法
export function asyncFn(fn: Function): void {
  if (typeof setImmediate === 'function') {
    setImmediate(fn)
  } else {
    setTimeoutFn(fn, 0)
  }
}

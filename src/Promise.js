// @flow
import {
  PENDING,
  noop,
  doResolve,
  Deferred,
  handleDeferred
} from './shared'

class Promise {
  // 静态方法
  static all: Function
  static race: Function
  static finally: Function
  static resolve: Function
  static reject: Function

  // Promise 状态
  _state: State
  // 是否处理过 ( Promise.resolve() 或 Promise.reject() )
  _handled: boolean
  // 保存 resolve 或 reject 的值
  _value: any
  // 是否存在还在等待的 Promise (Promise.resolve(x), x 为一个 Promise 的情况)
  _hasPending: boolean
  // 延迟队列数组
  _deferreds: Array<Deferred>

  /**
   * Promise 构造方法
   * @param executor
   */
  constructor(executor: Function): void {
    if (typeof executor !== 'function') {
      throw new TypeError(`Promise resolver ${executor} is not a function`)
    }

    this._state = PENDING
    this._handled = false
    this._value = undefined
    this._hasPending = false
    this._deferreds = []

    doResolve(executor, this)
  }

  /**
   * Promise.prototype.then
   * @param onFulfilled
   * @param onRejected
   */
  then(onFulfilled?: Function, onRejected?: Function): Promise {
    const promise = new Promise(noop)
    const deferred = new Deferred(onFulfilled, onRejected, promise)
    // 处理延迟队列
    handleDeferred(this, deferred)
    return promise
  }

  /**
   * Promise.prototype.catch
   * @param onRejected
   * @return {Promise}
   */
  catch(onRejected?: Function): Promise {
    // 调用 Promise.prototype.then, 不处理 onFulfilled
    return this.then(undefined, onRejected)
  }

  /**
   * Promise.prototype.finally
   * @param cb
   * @return {Promise}
   */
  finally(cb: Function): Promise {
    return this.then(value => {
      // 加入延迟执行队列，返回 Promise.resolve(value)
      // 与下面的 onRejected 执行条件互斥，要么执行 onFulfilled，要么执行 onRejected
      return Promise.resolve(cb()).then(() => {
        return value
      })
    }, reason => {
      // 加入延迟执行队列，返回 Promise.reject(reason)
      return Promise.resolve(cb()).then(() => {
        return Promise.reject(reason)
      })
    })
  }
}

Promise.all = () => {
}
Promise.race = () => {
}

Promise.resolve = value => {
  if (value instanceof Promise) {
    return value
  }
  return new Promise(resolve => {
    resolve(value)
  })
}

Promise.reject = reason => {
  return new Promise((resolve, reject) => {
    reject(reason)
  })
}

export default Promise

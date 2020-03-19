import {OnFulfilled, OnRejected, PromiseFn, PromiseState} from './types';

export default class Promise {
  static resolve(value?: any) {
    return new Promise(_resolve => {
      _resolve(value);
    })
  }

  static reject(reason?: any) {
    return new Promise((_resolve, _reject) => {
      _reject(reason);
    })
  }

  static all(promises: Promise[]) {
    const results: any[] = [];

    return new Promise((_resolve, _reject) => {
      promises.forEach((promise, index) => {
        promise.then((val) => {
          results[index] = val;
          if (Object.keys(results).length === promises.length) {
            _resolve(results);
          }
        }).catch((err) => {
          _reject(err);
        })
      });
    })
  }

  static race(promises: Promise[]) {
    return new Promise((_resolve, _reject) => {
      promises.forEach((promise) => {
        promise.then((val) => {
          _resolve(val);
        }).catch((err) => {
          _reject(err);
        })
      });
    })
  }

  value: any;
  state: PromiseState;
  private _resolve: OnFulfilled;
  private _reject: OnRejected;
  private _resolvedCallbacks: OnFulfilled[];
  private _rejectedCallbacks: OnRejected[];

  constructor(fn: PromiseFn) {
    this.value = undefined;
    this.state = PromiseState.PENDING;
    this._resolvedCallbacks = [];
    this._rejectedCallbacks = [];

    this._resolve = (value: any) => {
      if (value instanceof Promise) {
        value.then(this._resolve, this._reject);
      } else {
        setTimeout(() => {
          if (this.state === PromiseState.PENDING) {
            this.state = PromiseState.FULFILLED;
            this.value = value;
            this._resolvedCallbacks.forEach(cb => cb());
          }
        });
      }
    };

    this._reject = (reason: any) => {
      setTimeout(() => {
        if (this.state === PromiseState.PENDING) {
          this.state = PromiseState.REJECTED;
          this.value = reason;
          this._rejectedCallbacks.forEach(cb => cb())
        }
      })
    };

    try {
      fn(this._resolve, this._reject);
    } catch (e) {
      this._reject(e);
    }
  }

  /**
   * then
   * @param onFulfilled
   * @param onRejected
   * @see https://promisesaplus.com/#the-then-method
   */
  then(onFulfilled?: OnFulfilled, onRejected?: OnRejected): Promise {
    let promise: Promise;

    if (typeof onFulfilled !== 'function') {
      onFulfilled = (value) => value;
    }
    if (typeof onRejected !== 'function') {
      onRejected = (reason) => {
        throw reason;
      };
    }

    if (this.state === PromiseState.FULFILLED) {
      promise = new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            let x = (onFulfilled as OnFulfilled)(this.value);
            resolutionProcedure(promise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        })
      });
    } else if (this.state === PromiseState.REJECTED) {
      promise = new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            let x = (onRejected as OnRejected)(this.value);
            resolutionProcedure(promise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        })
      });
    } else {
      promise = new Promise((resolve, reject) => {
        this._resolvedCallbacks.push(() => {
          try {
            let x = (onFulfilled as OnFulfilled)(this.value);
            resolutionProcedure(promise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });

        this._rejectedCallbacks.push(() => {
          try {
            let x = (onRejected as OnRejected)(this.value);
            resolutionProcedure(promise, x, resolve, reject);
          } catch (e) {
            reject(e)
          }
        })
      });
    }

    return promise;
  }

  catch(onRejected?: OnRejected) {
    return this.then(undefined, onRejected);
  }

  finally() {
    //
  }
}

/**
 * #2.3 resolution procedure
 * @see https://promisesaplus.com/#the-promise-resolution-procedure
 */
function resolutionProcedure(promise: Promise, x: any, resolve: OnFulfilled, reject: OnRejected) {
  // #2.3.1
  if (promise === x) {
    reject(new TypeError('Error'));
    return
  }

  if (x instanceof Promise) {
    if (x.state === PromiseState.PENDING) {
      x.then((value) => {
        resolutionProcedure(promise, value, resolve, reject);
      }, reject);
    } else {
      x.then(resolve, reject);
    }
    return;
  }

  let called = false;

  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      let then = x.then;
      if (typeof then === 'function') {
        then.call(x, (y: any) => {
          if (called) return;
          called = true;
          resolutionProcedure(promise, y, resolve, reject)
        }, (e: any) => {
          if (called) return;
          called = true;
          reject(e);
        });
      } else {
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
}

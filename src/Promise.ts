import {OnFulfilled, OnRejected, PromiseFn, PromiseState} from './types';

export default class Promise {
  static resolve() {
    //
  }

  static reject() {
    //
  }

  static all() {
    //
  }

  static race() {
    //
  }

  private value: any;
  private state: PromiseState;

  constructor(fn: PromiseFn) {
    this.value = undefined;
    this.state = PromiseState.PENDING;
    try {
      fn(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }

  /**
   * then
   * @param onFulfilled
   * @param onRejected
   * @see https://promisesaplus.com/#the-then-method
   */
  then(onFulfilled?: OnFulfilled, onRejected?: OnRejected) {
    if (typeof onFulfilled !== 'function') {
      onFulfilled = (value) => value;
    }
    if (typeof onRejected !== 'function') {
      onRejected = (reason) => {
        throw reason;
      };
    }

    if (this.state === PromiseState.FULFILLED) {

    }
  }

  catch() {
    //
  }

  finally() {
    //
  }

  private resolve(value: any) {
    if (value instanceof Promise) {
      return value.then(this.resolve, this.reject);
    }

    setTimeout(() => {
      if (this.state === PromiseState.PENDING) {
        this.state = PromiseState.FULFILLED;
        this.value = value;
      }
    });
  }

  private reject(reason: any) {
    //
  }

  /**
   * #2.3 resolution procedure
   * @see https://promisesaplus.com/#the-promise-resolution-procedure
   */
  private resolutionProcedure(promise, x) {
    // #2.3.1
    if (promise === x) {
      throw new TypeError('Error');
    }

    if (x instanceof Promise) {
      if (x.state === PromiseState.PENDING) {
        x.then((value) => {
          this.resolutionProcedure(promise, value);
        }, this.reject);
      }
    }
  }
}

function resolve() {
  
}

function reject() {
  
}

function resolutionProcedure() {
  
}

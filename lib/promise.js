(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Promise = factory());
}(this, (function () { 'use strict';

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  // 保存 setTimeout 方法的引用，防止被其他框架更改
  var setTimeoutFn = setTimeout;

  // Promise 状态常量
  var PENDING = 'pending';
  var FULFILLED = 'fulfilled';
  var REJECTED = 'rejected';

  // 空操作函数
  function noop() {}

  // Deferred 类，用来分发处理 onFulfilled/onRejected
  var Deferred = function Deferred(onFulfilled, onRejected, promise) {
    classCallCheck(this, Deferred);

    // https://promisesaplus.com/#point-23
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : function (value) {
      return value;
    };
    onRejected = typeof onRejected === 'function' ? onRejected : function (reason) {
      throw reason;
    };
    this.onFulfilled = onFulfilled;
    this.onRejected = onRejected;
    this.promise = promise;
  };

  // 执行解析 Promise
  function doResolve(executor, promise) {
    // 确保 resolvePromise 或 rejectPromise 或 抛出异常只会调用一次，后续的会被忽略
    var called = false;
    try {
      executor(function (value) {
        if (called) return;
        called = true;
        handleResolve(promise, value);
      }, function (reason) {
        if (called) return;
        called = true;
        handleReject(promise, reason);
      });
    } catch (e) {
      if (called) return;
      called = true;
      handleReject(promise, e);
    }
  }

  // 处理 Promise resolve
  // https://promisesaplus.com/#the-promise-resolution-procedure
  function handleResolve(promise, x) {
    if (promise === x) {
      throw new TypeError('A promise cannot be resolved with itself.');
    }

    if (x instanceof Promise$1) {
      // https://promisesaplus.com/#point-49
      if (x._state === PENDING) {
        promise._hasPending = true;
        handleResolve(promise, x);
      } else if (x._state === FULFILLED) {
        promise._state = FULFILLED;
        promise._value = x._value;
      } else if (x._state === REJECTED) {
        promise._state = REJECTED;
        promise._value = x._value;
      }
    } else if (x !== null && x instanceof Object || typeof x === 'function') {
      // https://promisesaplus.com/#point-53
      var then = x.then;
      if (typeof then === 'function') {
        doResolve(then.bind(x), promise);
      } else {
        // https://promisesaplus.com/#point-63
        promise._state = FULFILLED;
        promise._value = x;
        finale(promise);
      }
    } else {
      // https://promisesaplus.com/#point-64
      promise._state = FULFILLED;
      promise._value = x;
      finale(promise);
    }
  }

  // 处理 Promise reject
  function handleReject(promise, reason) {
    promise._state = REJECTED;
    promise._value = reason;
    finale(promise);
  }

  // 处理延迟代码（注册的then、catch、finally）
  function handleDeferred(promise, deferred) {
    // resolve(x) x为一个 Promise 时，等待此 Promise resolve 或 reject
    if (promise._hasPending) {
      handleDeferred(promise, deferred);
      return;
    }

    //  Promise.then 注册后，Promise 的状态如果为 Pending，则加入延迟队列
    if (promise._state === PENDING) {
      promise._deferreds.push(deferred);
      return;
    }

    promise._handled = true;
    asyncFn(function () {
      var fn = promise._state === FULFILLED ? deferred.onFulfilled : deferred.onRejected;
      try {
        handleResolve(deferred.promise, fn(promise._value));
      } catch (e) {
        handleReject(deferred.promise, e);
      }
    });
  }

  // 最后执行
  function finale(promise) {
    if (promise._state === REJECTED && promise._deferreds.length === 0) {
      asyncFn(function () {
        if (!promise._handled) {
          unhandledRejectionFn(promise);
        }
      });
    }

    promise._deferreds.forEach(function (deferred) {
      handleDeferred(promise, deferred);
    });
    promise._deferreds = [];
  }

  function unhandledRejectionFn(error) {
    if (console != null) {
      console.warn('Uncaught (in promise)', error);
    }
  }

  // 平台异步调用方法
  function asyncFn(fn) {
    if (typeof setImmediate === 'function') {
      setImmediate(fn);
    } else {
      setTimeoutFn(fn, 0);
    }
  }

  var Promise$1 = function () {

    /**
     * Promise 构造方法
     * @param executor
     */

    // 是否存在还在等待的 Promise (Promise.resolve(x), x 为一个 Promise 的情况)

    // 是否处理过 ( Promise.resolve() 或 Promise.reject() )

    // 静态方法
    function Promise(executor) {
      classCallCheck(this, Promise);

      if (typeof executor !== 'function') {
        throw new TypeError('Promise resolver ' + executor + ' is not a function');
      }

      this._state = PENDING;
      this._handled = false;
      this._value = undefined;
      this._hasPending = false;
      this._deferreds = [];

      doResolve(executor, this);
    }

    /**
     * Promise.prototype.then
     * @param onFulfilled
     * @param onRejected
     */

    // 延迟队列数组

    // 保存 resolve 或 reject 的值


    // Promise 状态


    createClass(Promise, [{
      key: 'then',
      value: function then(onFulfilled, onRejected) {
        var promise = new Promise(noop);
        var deferred = new Deferred(onFulfilled, onRejected, promise);
        // 处理延迟队列
        handleDeferred(this, deferred);
        return promise;
      }

      /**
       * Promise.prototype.catch
       * @param onRejected
       * @return {Promise}
       */

    }, {
      key: 'catch',
      value: function _catch(onRejected) {
        // 调用 Promise.prototype.then, 不处理 onFulfilled
        return this.then(undefined, onRejected);
      }

      /**
       * Promise.prototype.finally
       * @param cb
       * @return {Promise}
       */

    }, {
      key: 'finally',
      value: function _finally(cb) {
        return this.then(function (value) {
          // 加入延迟执行队列，返回 Promise.resolve(value)
          // 与下面的 onRejected 执行条件互斥，要么执行 onFulfilled，要么执行 onRejected
          return Promise.resolve(cb()).then(function () {
            return value;
          });
        }, function (reason) {
          // 加入延迟执行队列，返回 Promise.reject(reason)
          return Promise.resolve(cb()).then(function () {
            return Promise.reject(reason);
          });
        });
      }
    }]);
    return Promise;
  }();

  Promise$1.all = function () {};
  Promise$1.race = function () {};

  Promise$1.resolve = function (value) {
    if (value instanceof Promise$1) {
      return value;
    }
    return new Promise$1(function (resolve) {
      resolve(value);
    });
  };

  Promise$1.reject = function (reason) {
    return new Promise$1(function (resolve, reject) {
      reject(reason);
    });
  };

  return Promise$1;

})));

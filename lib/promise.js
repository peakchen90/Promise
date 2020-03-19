(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Promise = factory());
}(this, function () { 'use strict';

  var PromiseState;
  (function (PromiseState) {
      PromiseState[PromiseState["PENDING"] = 0] = "PENDING";
      PromiseState[PromiseState["FULFILLED"] = 1] = "FULFILLED";
      PromiseState[PromiseState["REJECTED"] = 2] = "REJECTED";
  })(PromiseState || (PromiseState = {}));

  var Promise = /** @class */ (function () {
      function Promise(fn) {
          var _this = this;
          this.value = undefined;
          this.state = PromiseState.PENDING;
          this._resolvedCallbacks = [];
          this._rejectedCallbacks = [];
          this._resolve = function (value) {
              if (value instanceof Promise) {
                  value.then(_this._resolve, _this._reject);
              }
              else {
                  setTimeout(function () {
                      if (_this.state === PromiseState.PENDING) {
                          _this.state = PromiseState.FULFILLED;
                          _this.value = value;
                          _this._resolvedCallbacks.forEach(function (cb) { return cb(); });
                      }
                  });
              }
          };
          this._reject = function (reason) {
              setTimeout(function () {
                  if (_this.state === PromiseState.PENDING) {
                      _this.state = PromiseState.REJECTED;
                      _this.value = reason;
                      _this._rejectedCallbacks.forEach(function (cb) { return cb(); });
                  }
              });
          };
          try {
              fn(this._resolve, this._reject);
          }
          catch (e) {
              this._reject(e);
          }
      }
      Promise.resolve = function (value) {
          return new Promise(function (_resolve) {
              _resolve(value);
          });
      };
      Promise.reject = function (reason) {
          return new Promise(function (_resolve, _reject) {
              _reject(reason);
          });
      };
      Promise.all = function (promises) {
          var results = [];
          return new Promise(function (_resolve, _reject) {
              promises.forEach(function (promise, index) {
                  promise.then(function (val) {
                      results[index] = val;
                      if (results.length === promises.length) {
                          _resolve(results);
                      }
                  }).catch(function (err) {
                      _reject(err);
                  });
              });
          });
      };
      Promise.race = function (promises) {
          return new Promise(function (_resolve, _reject) {
              promises.forEach(function (promise) {
                  promise.then(function (val) {
                      _resolve(val);
                  }).catch(function (err) {
                      _reject(err);
                  });
              });
          });
      };
      /**
       * then
       * @param onFulfilled
       * @param onRejected
       * @see https://promisesaplus.com/#the-then-method
       */
      Promise.prototype.then = function (onFulfilled, onRejected) {
          var _this = this;
          var promise;
          if (typeof onFulfilled !== 'function') {
              onFulfilled = function (value) { return value; };
          }
          if (typeof onRejected !== 'function') {
              onRejected = function (reason) {
                  throw reason;
              };
          }
          if (this.state === PromiseState.FULFILLED) {
              promise = new Promise(function (resolve, reject) {
                  setTimeout(function () {
                      try {
                          var x = onFulfilled(_this.value);
                          resolutionProcedure(promise, x, resolve, reject);
                      }
                      catch (e) {
                          reject(e);
                      }
                  });
              });
          }
          else if (this.state === PromiseState.REJECTED) {
              promise = new Promise(function (resolve, reject) {
                  setTimeout(function () {
                      try {
                          var x = onRejected(_this.value);
                          resolutionProcedure(promise, x, resolve, reject);
                      }
                      catch (e) {
                          reject(e);
                      }
                  });
              });
          }
          else {
              promise = new Promise(function (resolve, reject) {
                  _this._resolvedCallbacks.push(function () {
                      try {
                          var x = onFulfilled(_this.value);
                          resolutionProcedure(promise, x, resolve, reject);
                      }
                      catch (e) {
                          reject(e);
                      }
                  });
                  _this._rejectedCallbacks.push(function () {
                      try {
                          var x = onRejected(_this.value);
                          resolutionProcedure(promise, x, resolve, reject);
                      }
                      catch (e) {
                          reject(e);
                      }
                  });
              });
          }
          return promise;
      };
      Promise.prototype.catch = function (onRejected) {
          return this.then(undefined, onRejected);
      };
      Promise.prototype.finally = function () {
          //
      };
      return Promise;
  }());
  /**
   * #2.3 resolution procedure
   * @see https://promisesaplus.com/#the-promise-resolution-procedure
   */
  function resolutionProcedure(promise, x, resolve, reject) {
      // #2.3.1
      if (promise === x) {
          reject(new TypeError('Error'));
          return;
      }
      if (x instanceof Promise) {
          if (x.state === PromiseState.PENDING) {
              x.then(function (value) {
                  resolutionProcedure(promise, value, resolve, reject);
              }, reject);
          }
          else {
              x.then(resolve, reject);
          }
          return;
      }
      var called = false;
      if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
          try {
              var then = x.then;
              if (typeof then === 'function') {
                  then.call(x, function (y) {
                      if (called)
                          return;
                      called = true;
                      resolutionProcedure(promise, y, resolve, reject);
                  }, function (e) {
                      if (called)
                          return;
                      called = true;
                      reject(e);
                  });
              }
              else {
                  resolve(x);
              }
          }
          catch (e) {
              if (called)
                  return;
              called = true;
              reject(e);
          }
      }
      else {
          resolve(x);
      }
  }

  return Promise;

}));
//# sourceMappingURL=Promise.js.map

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
  //# sourceMappingURL=types.js.map

  var Promise = /** @class */ (function () {
      function Promise(fn) {
          this.value = undefined;
          this.state = PromiseState.PENDING;
          try {
              fn(this.resolve, this.reject);
          }
          catch (e) {
              this.reject(e);
          }
      }
      Promise.resolve = function () {
          //
      };
      Promise.reject = function () {
          //
      };
      Promise.all = function () {
          //
      };
      Promise.race = function () {
          //
      };
      /**
       * then
       * @param onFulfilled
       * @param onRejected
       * @see https://promisesaplus.com/#the-then-method
       */
      Promise.prototype.then = function (onFulfilled, onRejected) {
          if (this.state === PromiseState.FULFILLED) ;
      };
      Promise.prototype.catch = function () {
          //
      };
      Promise.prototype.finally = function () {
          //
      };
      Promise.prototype.resolve = function (value) {
          var _this = this;
          if (value instanceof Promise) {
              return value.then(this.resolve, this.reject);
          }
          setTimeout(function () {
              if (_this.state === PromiseState.PENDING) {
                  _this.state = PromiseState.FULFILLED;
                  _this.value = value;
              }
          });
      };
      Promise.prototype.reject = function (reason) {
          //
      };
      /**
       * #2.3 resolution procedure
       * @see https://promisesaplus.com/#the-promise-resolution-procedure
       */
      Promise.prototype.resolutionProcedure = function (promise, x) {
          var _this = this;
          // #2.3.1
          if (promise === x) {
              throw new TypeError('Error');
          }
          if (x instanceof Promise) {
              if (x.state === PromiseState.PENDING) {
                  x.then(function (value) {
                      _this.resolutionProcedure(promise, value);
                  }, this.reject);
              }
          }
      };
      return Promise;
  }());

  //# sourceMappingURL=index.js.map

  return Promise;

}));
//# sourceMappingURL=promise.js.map

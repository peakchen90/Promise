(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Promise = factory());
}(this, function () { 'use strict';

  var Promise = /** @class */ (function () {
      function Promise(fn) {
          //
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
      Promise.prototype.then = function () {
          //
      };
      Promise.prototype.catch = function () {
          //
      };
      Promise.prototype.finally = function () {
          //
      };
      return Promise;
  }());

  //# sourceMappingURL=index.js.map

  return Promise;

}));
//# sourceMappingURL=promise.js.map

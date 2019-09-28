const Promise = require('../lib/promise');

module.exports = {
  rejected: Promise.reject,
  resolved: Promise.resolve,
  deferred() {
    const obj = {};
    const promise = new Promise((resolve, reject) => {
      obj.resolve = resolve;
      obj.reject = reject;
    });
    obj.promise = promise;
    return obj;
  },
};

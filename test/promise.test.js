const { expect } = require('chai');

const MyPromise = require('../lib/promise');

const adapter = {
  resolved: MyPromise.resolve,
  rejected: MyPromise.reject,
  deferred: () => {
    let resolve;
    let reject;

    const promise = new MyPromise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });

    return {
      promise,
      resolve,
      reject,
    };
  },
};


describe('Promises/A+ Tests', () => {
  require('promises-aplus-tests').mocha(adapter);
});

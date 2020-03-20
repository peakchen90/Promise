const { expect } = require('chai');

const Promise = require('../lib/promise');

const adapter = {
  resolved: Promise.resolve,
  rejected: Promise.reject,
  deferred: () => {
    let resolve;
    let reject;

    const promise = new Promise((_resolve, _reject) => {
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

function resolveVal(ms, val) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(val);
    }, ms);
  });
}

function rejectErr(ms, err) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(err);
    }, ms);
  });
}

describe('Promises/A+ Tests', () => {
  require('promises-aplus-tests').mocha(adapter);
});

describe('Promise prototype functions', () => {
  it('Promises.prototype.catch()', (done) => {
    new Promise(() => {
      throw 1;
    }).catch((e) => {
      expect(e).equal(1);
      done();
    });
  });

  it('Promises.prototype.finally()', (done) => {
    let i = 0;
    new Promise((resolve) => {
      resolve(0);
    }).then((val) => {
      i++;
      expect(i).equal(1);
      throw val;
    }).catch((val) => {
      i++;
      expect(i).equal(2);
    }).finally((val) => {
      i++;
      expect(i).equal(3);
      done();
    });
  });
});


describe('Promises static functions', () => {
  it('Promises.resolve()', async () => {
    const a = Promise.resolve(1);
    const b = await a;
    expect(a).instanceOf(Promise);
    expect(b).equal(1);
    expect(Promise.resolve(a)).equal(a);
  });

  it('Promises.reject()', async () => {
    const a = Promise.reject(1);
    expect(a).instanceOf(Promise);
    try {
      const b = await a;
    } catch (e) {
      expect(e).equal(1);
    }
  });

  it('Promises.reject()', async () => {
    const a = Promise.reject(1);
    expect(a).instanceOf(Promise);
    try {
      const b = await a;
    } catch (e) {
      expect(e).equal(1);
    }
  });

  it('Promises.all()', async () => {
    const [a, b, c] = await Promise.all([
      resolveVal(100, 1),
      resolveVal(150, 2),
      resolveVal(50, 3),
    ]);
    expect(a).equal(1);
    expect(b).equal(2);
    expect(c).equal(3);
  });

  it('Promises.race()', async () => {
    const a = await Promise.race([
      rejectErr(150, 1),
      resolveVal(100, 2),
      resolveVal(50, 3),
    ]);
    expect(a).equal(3);
  });
});

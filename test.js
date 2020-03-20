const Promise = require('./lib/promise');

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

Promise.race([
  resolveVal(1000, 1),
  resolveVal(300, 2),
  rejectErr(500, 3),
]).then((r) => {
  console.log(r);
}).catch(e => {
  console.error(e);
});

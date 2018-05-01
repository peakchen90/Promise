const Promise = require('../lib/promise')
const adapter = require('./adapater')
const { expect } = require('chai')

describe('Promises/A+ Tests', () => {
  // require('promises-aplus-tests').mocha(adapter)
})

describe('base test', () => {
  it('--->', () => {
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(222)
      }, 1000)
      reject('hhhhhh')
    })
    promise.then(res => {
      console.log('res1', res)
      return res + 100
    }).then(res => {
      console.log('res2', res)
    }).catch(e => {
      console.error('error', e)
    }).finally(() => {
      console.log('finally 1')
    })
  })
})

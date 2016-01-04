import crxify from '../index.js'
import test from 'tape'
import browserify from 'browserify'
import parseCRX from 'crx-parser'
import utils from './utils/test-utils'

function browserifyBundle(opts) {
  return new Promise((resolve, reject) => {
    let b = browserify(`${__dirname}/lib/src/app.js`)
    b.plugin(crxify, opts)
    b.bundle()
    resolve()
  })
}

test("Package app", function(t) {
  let timer = setTimeout(() => {
    t.fail("Extension not created")
  },5000)
  utils.createPrivateKey(`${__dirname}/lib/privateKey.pem`)
    .then(browserifyBundle.bind(this, {
      o: `${__dirname}/lib/extension.crx`, 
      e: `${__dirname}/lib/chrome-extension`,
      p: `${__dirname}/lib/privateKey.pem`
    }))
    .then(utils.firstFileChange.bind(this, `${__dirname}/lib/extension.crx`))
    .then((rawCrx) => {
      parseCRX(rawCrx, (err, data) => {
        if (err) return t.fail(err)
        clearTimeout(timer)
        t.pass("Package successfully created")
        utils.cleanup(`${__dirname}/lib/privateKey.pem`, `${__dirname}/lib/extension.crx`)
        t.end()
      })
    }).catch((reason) => {
      t.fail(reason)
    })
})

test("Mixed opts", function(t) {
  let timer = setTimeout(() => {
    t.fail("Extension not created")
  },5000)
  utils.createPrivateKey(`${__dirname}/lib/privateKey.pem`)
    .then(browserifyBundle.bind(this, {
      "out-file": `${__dirname}/lib/extension.crx`, 
      e: `${__dirname}/lib/chrome-extension`,
      "private-key": `${__dirname}/lib/privateKey.pem`
    }))
    .then(utils.firstFileChange.bind(this, `${__dirname}/lib/extension.crx`))
    .then((rawCrx) => {
      parseCRX(rawCrx, (err, data) => {
        if (err) return t.fail(err)
        clearTimeout(timer)
        t.pass("Package successfully created")
        utils.cleanup(`${__dirname}/lib/privateKey.pem`, `${__dirname}/lib/extension.crx`)
        t.end()
      })
    }).catch((reason) => {
      t.fail(reason)
    })
})

test("File already exists", function(t) {
  let timer = setTimeout(() => {
    t.fail("Extension not created")
  },5000)
  utils.createPrivateKey(`${__dirname}/lib/privateKey.pem`)
    .then(utils.touchFile.bind(this, `${__dirname}/lib/extension.crx`))
    .then(browserifyBundle.bind(this, {
        o: `${__dirname}/lib/extension.crx`, 
        e: `${__dirname}/lib/chrome-extension`,
        p: `${__dirname}/lib/privateKey.pem`
    }))
    .then(utils.firstFileChange.bind(this, `${__dirname}/lib/extension.crx`))
    .then((rawCrx) => {
      parseCRX(rawCrx, (err, data) => {
        if (err) return t.fail(err)
        clearTimeout(timer)
        t.pass("Package successfully created")
        utils.cleanup(`${__dirname}/lib/privateKey.pem`, `${__dirname}/lib/extension.crx`)
        t.end()
      })
  }).catch((reason) => {
      t.fail(reason)
  })
})

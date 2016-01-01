import crxify from '../index.js'
import test from 'tape'
import browserify from 'browserify'
import fs from 'fs'
import parseCRX from 'crx-parser'
import NodeRSA from 'node-rsa'

test("Package app", function(t) {
  function createPrivateKey(path, cb) {
    let key = new NodeRSA({b: 512});
    let exported = key.exportKey("pkcs1-private-pem")
    fs.writeFile(path, exported, cb)
  }

  createPrivateKey(`${__dirname}/lib/privateKey.pem`, (err) => {
    if (err) return t.fail(err)
    let b = browserify(`${__dirname}/lib/src/app.js`)
    b.plugin(crxify, { 
      o: `${__dirname}/lib/extension.crx`, 
      e: `${__dirname}/lib/chrome-extension`,
      p: `${__dirname}/lib/privateKey.pem`
    })
    b.bundle()
    let timer = setTimeout(() => {
      t.fail("Extension not created")
    },5000)
    fs.watchFile(`${__dirname}/lib/extension.crx`, {persistent: false, interval: 100}, (curr, prev) => {
      fs.readFile(`${__dirname}/lib/extension.crx`, (err, rawCrx) => {
        if (err) return;
        parseCRX(rawCrx, (err, data) => {
          if (err) return t.fail(err)
          clearTimeout(timer)
          t.pass("Package successfully created.")
          fs.unlink(`${__dirname}/lib/privateKey.pem`)
          fs.unlink(`${__dirname}/lib/extension.crx`)
          t.end()
        })
      })
    })
  })
})

import test from 'tape'
import browserify from 'browserify'
import parseCRX from 'crx-parser'
import utils from './utils/test-utils'
import fs from 'fs'
import { fork } from 'child_process'

function spawnCmd (opts) {
  let cmd = `${__dirname}/../dist/cmd.js`
  let flattened = Object.keys(opts).reduce((memo, key) => {
    memo.push(key, opts[key])
    return memo
  }, [])
  return new Promise((resolve, reject) => {
    let crxify = fork(cmd, flattened, {silent: true})
    crxify.stderr.on("error", (err) => {
      crxify.kill()
      reject(err)
    })
    crxify.stdout.on("data", (data) => {
      if (data.toString().trim() === `Wrote ${opts["-o"]}`) {
        crxify.kill()
        resolve(data)
      }
    })
  })
}

function getFileContents (path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, file) => {
      if (err) return reject(err)
      resolve(file)
    })
  })
}

test("Package app", function(t) {
  let timer = setTimeout(() => {
    t.fail("Extension not created")
  },5000)
  let args = {
    "-o": `${__dirname}/lib/extension.crx`, 
    "-e": `${__dirname}/lib/chrome-extension`,
    "-p": `${__dirname}/lib/privateKey.pem`
  }
  utils.createPrivateKey(args["-p"])
    .then(spawnCmd.bind(this, args))
    .then(getFileContents.bind(this, args["-o"]))
    .then((rawCrx) => {
      parseCRX(rawCrx, (err, data) => {
        if (err) return t.fail(err)
        clearTimeout(timer)
        t.pass("Package successfully created")
        utils.cleanup(args["-p"], args["-o"])
        t.end()
      })
    }).catch((reason) => {
      t.fail(reason)
    })
})

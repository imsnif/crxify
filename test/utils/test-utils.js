import NodeRSA from 'node-rsa'
import fs from 'fs'

export default {
  createPrivateKey: function (path) {
    return new Promise((resolve, reject) => {
      let key = new NodeRSA({b: 512})
      let exported = key.exportKey("pkcs1-private-pem")
      fs.writeFile(path, exported, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  },
  firstFileChange: function(filePath) {
    return new Promise((resolve, reject) => {
      fs.watchFile(filePath, {persistent: false, interval: 100}, (curr, prev) => {
        fs.readFile(filePath, (err, contents) => {
          if (err && err.code !== "ENOENT") return reject(err)
          // We only want to return a change if the file exists or is created
          if (contents) {
            resolve(contents)
          }
        })
      })
    })
  },
  cleanup: function(...files) {
    if (files) {
      files.forEach((file) => {
        fs.unlink(file)
      })
    }
  },
  touchFile: function(filePath) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, resolve.bind(this))
    })
  }
}


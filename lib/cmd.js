#!/usr/bin/env node

import ChromeExtension from 'crx'
import fs from 'fs'
import commander from 'commander'
import chokidar from 'chokidar'
import debounce from 'debounce'
import { version } from '../package.json'

commander
  .version(version)
  .option('-e, --extension-lib [lib]', 'Extension library to watch, defaults to ./public', './public')
  .option('-o, --out-file [file]', 'crx output file path, defaults to ./extension.crx', './extension.crx')
  .option('-p, --private-key [key]', 'Private key to pack the crx (required)')
  .parse(process.argv)

if (!commander.privateKey) commander.help()

fs.readFile(commander.privateKey, (err, keyContents) => {
  if (err) throw new Error(err)
  let watcher = chokidar.watch(commander.extensionLib, {
    ignored: /[\/\\]\./, 
    persistent: true
  });
  console.log("Watching:", commander.extensionLib)
  watcher.on("all", debounce(bundleCrx.bind(null, keyContents), 200))
})

function bundleCrx(key) {
  let crx = new ChromeExtension({
    rootDirectory: commander.extensionLib,
    privateKey: key
  })
  crx.load().then(() => {
    return crx.pack().then((crxBuffer) => {
      fs.writeFile(commander.outFile, crxBuffer, () => {
        console.log(`Wrote ${commander.outFile}`)
      })
    })
  }).catch((reason) => {
    console.error(`Failed to crxify: ${reason}`)
  })
}

import HappyEnd from 'happy-end'
import ChromeExtension from 'crx'
import fs from 'fs'

function parseOpts(opts) {
  let parsed = {};
  ["extension-lib", "out-file", "private-key"].forEach((requirement) => {
    if (opts[requirement] || opts[requirement.charAt(0)]) { //Full arg or first letter abbreviation
      parsed[requirement] = opts[requirement] || opts[requirement.charAt(0)]
    } else {
      throw new Error(`Missing required argument: ${requirement}`)
    }
  })
  return parsed
}

function bundleCrx(opts) {
  let libPath        = opts["extension-lib"]
  let privateKeyPath = opts["private-key"]
  let crxPath        = opts["out-file"]
  let crx = new ChromeExtension({
    rootDirectory: libPath,
    privateKey: fs.readFileSync(privateKeyPath)
  })
  crx.load().then(() => {
    return crx.pack().then((crxBuffer) => {
      fs.writeFile(crxPath, crxBuffer)
    })
  }).catch((reason) => {
    console.log(`Failed to crxify: ${reason}`)
  })
}

export default function crxify (b, opts) {
  let group = new HappyEnd()
  let finished = group.add(b.pipeline._streams)
  finished.then((number) => {
    bundleCrx(parseOpts(opts))
  })
  .catch((reason) => {
    throw new Error(`Failed to crxify: ${reason}`)
  })
  b.on("update", () => {
    bundleCrx(parseOpts(opts))
    console.log("updated!")
  })
}

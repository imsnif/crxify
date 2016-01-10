import HappyEnd from 'happy-end'
import ChromeExtension from 'crx'
import fs from 'fs'

function parseOpts(opts) {
  let parsed = {};
  ["extension-lib", "out-file", "private-key"].forEach((requirement) => {
    if (opts[requirement] || opts[requirement.charAt(0)]) { //Full arg or first letter abbreviation
      parsed[requirement] = opts[requirement] || opts[requirement.charAt(0)]
    } else {
      console.error(`Missing required argument: ${requirement}`)
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
      fs.writeFile(crxPath, crxBuffer, () => {})
    })
  }).catch((reason) => {
    console.error(`Failed to crxify: ${reason}`)
  })
}

let counter = 0

function addPipeline(group, streams) { //TODO: bind group to this
  if (Array.isArray(streams)) {
    let promise
    streams.forEach((stream) => {
      promise = addPipeline(group, stream)
    })
    return promise
  } else {
    let promise = group.add(streams)
    if (streams._streams) {
      return addPipeline(group, streams._streams)
    }
    counter += 1
    return promise
  }
}

export default function crxify (b, opts) {
  let group = new HappyEnd()
  let finished = addPipeline(group, [ b.pipeline._streams, b._bpack ])
  finished.then((number) => {
    setTimeout(bundleCrx.bind(bundleCrx, parseOpts(opts)),1000)
    // TODO: Turn this whole thing around so browserify will be run programmatically
  })
  .catch((reason) => {
    console.error(`Failed to crxify: ${reason}`)
  })
  b.on("update", () => {
    bundleCrx(parseOpts(opts))
  })
}

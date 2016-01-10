'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = crxify;

var _happyEnd = require('happy-end');

var _happyEnd2 = _interopRequireDefault(_happyEnd);

var _crx = require('crx');

var _crx2 = _interopRequireDefault(_crx);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseOpts(opts) {
  var parsed = {};
  ["extension-lib", "out-file", "private-key"].forEach(function (requirement) {
    if (opts[requirement] || opts[requirement.charAt(0)]) {
      //Full arg or first letter abbreviation
      parsed[requirement] = opts[requirement] || opts[requirement.charAt(0)];
    } else {
      console.error('Missing required argument: ' + requirement);
    }
  });
  return parsed;
}

function bundleCrx(opts) {
  var libPath = opts["extension-lib"];
  var privateKeyPath = opts["private-key"];
  var crxPath = opts["out-file"];
  var crx = new _crx2.default({
    rootDirectory: libPath,
    privateKey: _fs2.default.readFileSync(privateKeyPath)
  });
  crx.load().then(function () {
    return crx.pack().then(function (crxBuffer) {
      _fs2.default.writeFile(crxPath, crxBuffer, function () {});
    });
  }).catch(function (reason) {
    console.error('Failed to crxify: ' + reason);
  });
}

var counter = 0;

function addPipeline(group, streams) {
  //TODO: bind group to this
  if (Array.isArray(streams)) {
    var promise = undefined;
    streams.forEach(function (stream) {
      promise = addPipeline(group, stream);
    });
    return promise;
  } else {
    var promise = group.add(streams);
    if (streams._streams) {
      return addPipeline(group, streams._streams);
    }
    counter += 1;
    return promise;
  }
}

function crxify(b, opts) {
  var group = new _happyEnd2.default();
  var finished = addPipeline(group, [b.pipeline._streams, b._bpack]);
  finished.then(function (number) {
    setTimeout(bundleCrx.bind(bundleCrx, parseOpts(opts)), 1000);
    // TODO: Turn this whole thing around so browserify will be run programmatically
  }).catch(function (reason) {
    console.error('Failed to crxify: ' + reason);
  });
  b.on("update", function () {
    bundleCrx(parseOpts(opts));
  });
}
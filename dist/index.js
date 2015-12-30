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
      throw new Error('Missing required argument: ' + requirement);
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
      _fs2.default.writeFile(crxPath, crxBuffer);
    });
  }).catch(function (reason) {
    console.log('Failed to crxify: ' + reason);
  });
}

function crxify(b, opts) {
  var group = new _happyEnd2.default();
  var finished = group.add(b.pipeline._streams);
  finished.then(function (number) {
    bundleCrx(parseOpts(opts));
  }).catch(function (reason) {
    throw new Error('Failed to crxify: ' + reason);
  });
  b.on("update", function () {
    bundleCrx(parseOpts(opts));
    console.log("updated!");
  });
}
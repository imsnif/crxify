'use strict';

var _crx = require('crx');

var _crx2 = _interopRequireDefault(_crx);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _debounce = require('debounce');

var _debounce2 = _interopRequireDefault(_debounce);

var _package = require('../package.json');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.version(_package.version).option('-e, --extension-lib [lib]', 'Extension library to watch, defaults to ./public', './public').option('-o, --out-file [file]', 'crx output file path, defaults to ./extension.crx', './extension.crx').option('-p, --private-key [key]', 'Private key to pack the crx (required)').parse(process.argv);

if (!_commander2.default.privateKey) _commander2.default.help();

_fs2.default.readFile(_commander2.default.privateKey, function (err, keyContents) {
  if (err) throw new Error(err);
  var watcher = _chokidar2.default.watch(_commander2.default.extensionLib, {
    ignored: /[\/\\]\./,
    persistent: true
  });
  console.log("Watching:", _commander2.default.extensionLib);
  watcher.on("all", (0, _debounce2.default)(bundleCrx.bind(null, keyContents), 200));
});

function bundleCrx(key) {
  var crx = new _crx2.default({
    rootDirectory: _commander2.default.extensionLib,
    privateKey: key
  });
  crx.load().then(function () {
    return crx.pack().then(function (crxBuffer) {
      _fs2.default.writeFile(_commander2.default.outFile, crxBuffer, function () {
        console.log('Wrote ' + _commander2.default.outFile);
      });
    });
  }).catch(function (reason) {
    console.error('Failed to crxify: ' + reason);
  });
}
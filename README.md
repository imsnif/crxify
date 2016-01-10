# crxify

### Command line utility for building chrome crx files

Inspired by [`browserify`](https://github.com/substack/node-browserify) (and more specifically, by [`watchify`](https://github.com/substack/watchify)) - this tool was created in order to automate the process of packing a Chrome app or extension.

It watches the extension's directory and packs it to a crx file every time there's a change. (For one time, non-watched such builds, please see the excellent [`crx`](https://github.com/oncletom/crx) module).



## Installation
```
npm install crxify
```

## Usage
```
  Usage: crxify [options]

  Options:

    -h, --help                 output usage information
    -V, --version              output the version number
    -e, --extension-lib [lib]  Extension library to watch, defaults to ./public
    -o, --out-file [file]      crx output file path, defaults to ./extension.crx
    -p, --private-key [key]    Private key to pack the crx (required)
```
Crxify *intentionally* does not create a private key file for you. In order to create one, please see: https://help.github.com/articles/generating-ssh-keys/ (among others)

### group.add([streams]) / group.add(stream)
Accepts either a single stream or an array of streams to add to the group.
Returns a promise that resolves to the number of ended streams (see example above).


## Example Use Cases

Given the following library structure:
```
├── lib
├── LICENSE
├── package.json
├── extension.crx
├── public
└── README.md
```

Development is done in ./lib and then watchified/browserified to ./public.

Once it reaches ./public, it is crxified into extension.crx and can then immediately be loaded into Chrome.

This can be achieved by (assuming we're just doing some transpiling):
```
// package.json
{ 
  ...
  "scripts": {
    "watch-app": "watchify lib/app.js -t babelify --outfile public/js/bundle.js -v",
    "watch": "crxify -p /path/to/my/privateKey.pem & npm run watch-app"
  }
}

```
Then by simply executing:
```
npm run watch
```
## Contributions / Issues
Please feel free to open an issue or a PR if something's broken, or if you'd like some specific features added.

## License
MIT


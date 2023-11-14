const path = require('path');
const { pathToFileURL } = require('url');
const pkg = require('./package.json');

const distURLBase = `https://raw.githubusercontent.com/cc1234475/stashtag/main/dist/`;
const packageName = pkg.name;

const production = !process.env.ROLLUP_WATCH;
console.log('production', production);
const baseUrl = !production	? path.join(__dirname, 'dist') : distURLBase;
console.log('baseUrl', baseUrl);

let meta = {
    "name": production ? packageName : packageName + ' -> dev',
    "version": pkg.version,
    "description": pkg.description,
	"homepage": pkg.homepage,
	"author": pkg.author,
    "namespace": "https://github.com/cc1234475",
    "resource": {
		css: path.join(baseUrl, 'bundle.css')
	},
    "match": [
        "http://localhost:9999/*"
    ],
    "grant": [
        "GM_addStyle",
        "GM_getResourceText",
        "GM_xmlhttpRequest",
        "unsafeWindow"
    ],
    "connect": [
        "hf.space",
        "localhost"
    ],
    "run-at": "document-idle"
}

meta.require = [];

if(!production){
	meta.require = [
        pathToFileURL(path.join(baseUrl, 'stashtag.user.js'))
    ];
}

meta.require = [...meta.require, 'https://raw.githubusercontent.com/7dJx1qP/stash-userscripts/master/src/StashUserscriptLibrary.js']

if(production) {
	meta.downloadURL = path.join(baseUrl, 'stashtag.user.js');
	meta.updateURL = path.join(baseUrl, 'stashtag.user.js');
}

module.exports = meta;

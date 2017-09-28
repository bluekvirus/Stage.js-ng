const shell = require('shelljs');
const download = require('../util/download.js');
const colors = require('colors');
const path = require('path');


exports.command = 'assets' 
exports.desc = 'Copies/Excludes resources into the output folder. Can re-direct copies to different folders'
exports.handler = function(argv) {
			shell.cd(__dirname);
			shell.exec(`gulp -C "${argv.C}" --root "${argv.root}"  assets --silent`);
			console.log('Done with copying assets into output folder!');
};
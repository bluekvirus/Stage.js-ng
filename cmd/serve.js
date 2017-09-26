const shell = require('shelljs');
const colors = require('colors');
const path = require('path');
const yargs = require('yargs');


exports.command = 'serve' 
exports.desc = 'Start the static development web server, will also call watch tasks'
exports.handler = function(argv) {
	    shell.cd(__dirname);
	    shell.exec(`gulp -C "${argv.C}" --root "${argv.root}" serve --silent `);
	    console.log('Done with configuration change!');

};


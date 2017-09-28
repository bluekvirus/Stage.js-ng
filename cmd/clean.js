const shell = require('shelljs');
const colors = require('colors');
const path = require('path');



exports.command = 'clean'
exports.desc = 'Run the clean process on output folder'
exports.handler = function(argv) {
	    shell.cd(__dirname);
	    shell.exec(`gulp -C "${argv.C}" --root "${argv.root}"  clean --silent `); 
	    console.log('Done with cleaning!');

};


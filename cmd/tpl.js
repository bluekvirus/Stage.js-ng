const shell = require('shelljs');
const colors = require('colors');
const path = require('path');



exports.command = 'tpl' 
exports.desc = 'Combine html templates into one json file'
exports.handler = function(argv) {
	    shell.cd(__dirname);
	    shell.exec(`gulp -C "${argv.C}" tpl `); 
	    console.log('Done with combining templates');

};


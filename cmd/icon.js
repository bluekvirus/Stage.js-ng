const shell = require('shelljs');
const colors = require('colors');
const path = require('path');



exports.command = 'icon' //<prefix> is mandatory option
exports.desc = 'Run the icon process: Combine images into sprite and svg into iconfonts.'
exports.handler = function(argv) {
	    shell.cd(__dirname);
	    shell.exec(`gulp -C "${argv.C}" --root "${argv.root}" icon --silent`); // how to use gulp?
	    console.log('Done with icon process!');

};


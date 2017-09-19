const shell = require('shelljs');
const colors = require('colors');
const path = require('path');



exports.command = 'less' //<prefix> is mandatory option
exports.desc = 'Compile/combine less files into main.css'
exports.handler = function(argv) {
	    shell.cd(__dirname);
	    shell.exec(`gulp -C "${argv.C}" less `); // how to use gulp?
	    console.log('Done with compiling less into css!');

};


const shell = require('shelljs');
const colors = require('colors');
const path = require('path');



exports.command = 'js' 
exports.desc = 'Run the bundling/contatenation process on js files'
exports.handler = function(argv) {
	    shell.cd(__dirname);
	    shell.exec(`gulp -C "${argv.C}" --root "${argv.root}"  js --silent ` ); 
	    console.log('Done with js bundle/concatenation!');

};


const shell = require('shelljs');
const colors = require('colors');
const path = require('path');



exports.command = 'build'
exports.desc = 'Run the build process: [clean], [js], [less], [assets]'
exports.handler = function(argv) {
        shell.cd(__dirname);
	    shell.exec(`gulp -C "${argv.C}" default `); 
	    console.log('Done with build process!');

};


const shell = require('shelljs');
const download = require('../util/download.js');
const colors = require('colors');
const path = require('path');


exports.command = 'init' //<prefix> is mandatory option
exports.desc = 'Initializes default folder structure'
exports.handler = function() {
	download.downloading('https://github.com/ch3riee/Stage.js-ng/blob/ES6-v2.0/project_templates/default.tar.gz?raw=true', process.cwd(), true, function(cwdFolder){
            //console.log('Installing Nodejs libraries ...'.yellow);
			shell.cd(process.cwd());
			shell.exec('npm install');
			console.log('Done with installing');

    });
};

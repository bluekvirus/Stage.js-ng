const shell = require('shelljs');
const colors = require('colors');
const path = require('path');



exports.command = 'min' 
exports.desc = 'Minimize html, js, and css files in output folder'
exports.builder = {
  html: {
    alias: 'H',
    describe: 'Minimize the html only',
    default: false
  },
  css: {
    alias: 'C',
    describe: 'Minimize the css only',
    default: false
  },
  js: {
  	alias: 'J',
  	describe: 'Minimize the js only',
  	default: false
  }
}
exports.handler = function(argv) {
	    shell.cd(__dirname);
	    if(argv.H)
	    {
	    	shell.exec(`gulp -C "${argv.C}" min:html `);
	    }
	    else if(argv.C)
	    {
	    	shell.exec(`gulp -C "${argv.C}" min:css `);
	    }
	    else if(argv.J)
	    {
	    	shell.exec(`gulp -C "${argv.C}" min:js `);
	    }
	    else{
            shell.exec(`gulp -C "${argv.C}"  min` ); 
	    }
	    console.log('Done with minimizing!');

};


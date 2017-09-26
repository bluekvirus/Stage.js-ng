const shell = require('shelljs');
const colors = require('colors');
const path = require('path');



exports.command = 'min' 
exports.desc = 'Minimize html, js, and css files in output folder'
exports.builder = {
  html: {
    describe: 'Minimize the html only',
    type: 'boolean',
    default: false
  },
  css: {
    describe: 'Minimize the css only',
    type: 'boolean',
    default: false
  },
  js: {
  	describe: 'Minimize the js only',
  	type: 'boolean',
  	default: false
  }
}
exports.handler = function(argv) {
	    shell.cd(__dirname);
         console.log(argv.html);
         console.log(argv.js);
         console.log(argv.css);
	    if(argv.html)
	    {
	    	shell.exec(`gulp -C "${argv.C}" --root "${argv.root}"  min:html --silent `);
	    }
	    else if(argv.css)
	    {
	    	shell.exec(`gulp -C "${argv.C}" --root "${argv.root}"  min:css --silent `);
	    }
	    else if(argv.js)
	    {
	    	shell.exec(`gulp -C "${argv.C}" --root "${argv.root}"  min:js --silent `);
	    }
	    else{
            shell.exec(`gulp -C "${argv.C}" --root "${argv.root}"  min  --silent`); 
	    }
	   

};


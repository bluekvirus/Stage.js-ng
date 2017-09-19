#!/usr/bin/env node

'use strict'

const { join } = require('path');
const yargs = require('yargs');
const colors = require('colors');
const path = require('path');



if(require.main === module)  
{
var cwd = process.cwd();
var globalcwd = path.resolve(__dirname);
//load package.json
var packageInfo = require(path.join(globalcwd, 'package.json'));
var argv = yargs
  .commandDir(join(__dirname, 'cmd'))
  .usage('usage: $0 <command> [args]')
  .version(function() {
    console.log(packageInfo.version.yellow);
  })
  .option('C', {
  	'alias': 'config',
  	'description': 'Config path change',
  	'default': `${cwd}/src/config.js`
  })
  .help()
  .argv; 

}
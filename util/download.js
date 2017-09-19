'use strict'

const path = require('path');
const decompress = require('decompress');
const decompressTargz = require('decompress-targz');
const fs = require('fs-extra');
const colors = require('colors');
const shell = require('shelljs');
const download = require('../util/download.js');
const request = require('request');
const _ = require('lodash');

function downloading(url, folder, gflag, cb){
	console.log('Downloading'.yellow, url, '...'.yellow);
	//var gzFile = path.join(`/${folder}`, _.uniqueId('tmp_') + '.dat'); //folder is the current working directory of user
	//fs.ensureFileSync(gzFile);
	var gzFile = path.join(`/${folder}`, 'src.tar.gz');
	request(url).pipe(fs.createWriteStream(gzFile))
	            .on('finish', () => {
	                if (gflag) {
	            		console.log('Extracting folder structure...'.yellow);
	            		decompress(gzFile, folder, {
                           plugins: [
                           decompressTargz()
                           ]
                             }).then(files => {
                             console.log('done');

                             shell.rm(gzFile);
                             shell.cd('src');
                             shell.mv('package.json', '..');
                             cb(folder);
	            		});
	            	}
	            	else{
	            		cb(folder);
	            	} 
	            })
};

module.exports = {downloading};

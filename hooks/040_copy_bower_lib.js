#!/usr/bin/env node
'use strict';
//
// This hook copies various resource files 
// from our version control system directories 
// into the appropriate platform specific location
//

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

module.exports = function(context) {
	var targetPath = 'www/lib'
	var projectRoot = context.opts.projectRoot;
	var components = path.join(projectRoot, 'bower_components');
	var hookPromise = new Promise((s, f) => {
		glob(path.join(components, '**/@(*.@(min.@(js|css)|eot|svg|ttf|woff|woff2|otf)|*.min)'), null, (error, files) => {
			return error ? f({Error: 'Failed to find files.', Hook: __filename, Detail: error}) : s(files);
		});
	})
	.then(files => {
		return files.map(f => path.relative(components, f)).reduce((promiseChain, fileInfo) => {
			var source = path.join(components, fileInfo);
			var target = path.join(projectRoot, targetPath, fileInfo);
			return promiseChain.then(list => {
				return new Promise((s, f) => {
					fs.copy(source, target, error => error ? f({Error: `Issue copying file ${source} to ${target}: ${error}`, Hook: __filename}) : s(`Copy success: ${target}`));
				}).then(result => list.concat([result]));
			});
		}, Promise.resolve([]));
	})
	.catch(error => Promise.reject(JSON.stringify(error, null, 2)));

	hookPromise.then(files => console.log(JSON.stringify({Info: 'Fileds Copied by hook', Hook: __filename, Files: files }, null, 2)));
	return hookPromise;
};

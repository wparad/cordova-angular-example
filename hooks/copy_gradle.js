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
	if(context.opts.cordova.platforms.some(l => l == 'android')) {
		var hookPromise = new Promise((s, f) => {
			fs.copy('build-extras.gradle', 'platforms/android/build-extras.gradle',
				error => error ? f({Error: `Issue copying file build-extras.gradle: ${error}`, Hook: __filename}) : s(`Copy success: gradle extras`));
		});
		hookPromise.then(files => console.log(JSON.stringify({Info: 'Fileds Copied by hook', Hook: __filename, Files: files }, null, 2)));
		return hookPromise;
	}
	else {
		return Promise.resolve();
	}
};

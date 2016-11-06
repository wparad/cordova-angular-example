#!/usr/bin/env node
'use strict';
// This hook ensures no one has accidentally deleted the "cordova" script tag

const fs = require('fs-extra');
const path = require('path');
const Parser = require('xml2js').Parser;

module.exports = function(context) {
	var projectRoot = context.opts.projectRoot;
	var configPath = path.join(projectRoot, 'config.xml');
	var parser = new Parser();
	var hookPromise = new Promise((s, f) => fs.readFile(configPath, (error, data) => error ?	f({Error: 'Failed to read config file.', Detail: error}) : s(data)))
	.then(configString => new Promise((s, f) => parser.parseString(configString, (error, result) => error ?	f({Error: 'Failed to parse config file.', Detail: error}): s(result))))
	.then(config => {
		var indexPath = config.widget.content[0]['$'].src;
		if(indexPath) { return new Promise((s, f) => fs.readFile(path.join(projectRoot, "www", indexPath), (error, data) => error ? f(error) : s(data.toString('UTF-8')))); }
		else { return Promise.reject('No index file found'); }
	})
	.then(index => {
		var matches = index.match(/<script\s[^>]*src=['"](cordova*.js)['"].*\/script>/);
		if(matches) {
			return {
				Hook: __filename,
				Info: 'Looks like you are including the cordova libs:',
				Libraries: matches[1]
			};
		}
		else { return Promise.reject('Cannot find the Cordova lib script tag :('); }
	})
	.catch(error => Promise.reject(`${error} ${JSON.stringify({Hook: __filename, Error: error}, null, 2)}`));

	hookPromise.then(result => console.log(JSON.stringify(result, null, 2)));
	return hookPromise;
};

#!/usr/bin/env node
'use strict';

const fs = require('fs-extra');
const path = require('path');
const Parser = require('xml2js').Parser;
const plist = require('plist');

module.exports = function(context) {
	var projectRoot = context.opts.projectRoot;
	var configPath = path.join(projectRoot, 'config.xml');
	var parser = new Parser();
	var appNamePromise = new Promise((s, f) => fs.readFile(configPath, (error, data) => error ?	f({Error: 'Failed to read config file.', Detail: error}) : s(data)))
	.then(configString => new Promise((s, f) => parser.parseString(configString, (error, result) => error ?	f({Error: 'Failed to parse config file.', Detail: error}) : s(result))))
	.then(config => config.widget.name[0]);
	var hookPromise = appNamePromise.then(appName => {
		var plistPath = `platforms/ios/${appName}/${appName}-Info.plist`;
		return new Promise((s, f) => fs.readFile(plistPath, (error, data) => error ? f({Error: 'Failed to read plist file.', Detail: error}) : s(data)))
		.then(plistData => plist.parse(plistData.toString('utf8')))
		.then(xml => {
			xml.NSLocationWhenInUseUsageDescription = 'GolfPro uses your location to automatically locate the course you are on.';
			delete xml['NSMainNibFile'];
			delete xml['NSMainNibFile~ipad'];
			return plist.build(xml);
		})
		.then(plistData => {
			return new Promise((s, f) => fs.outputFile(plistPath, plistData, (error, data) => error ? f({Error: 'Failed to write plist file.', Detail: error}) : s(data)))
		});
	});

	hookPromise
	.then(files => console.log(JSON.stringify({Info: 'Plist updated by hook', Hook: __filename}, null, 2)))
	.catch(failure => console.log(JSON.stringify({Info: 'Plist Failed to be update by hook', Hook: __filename, Failure: failure.stack || failure.toString(), Detail: failure}, null, 2)));
	return hookPromise;
};
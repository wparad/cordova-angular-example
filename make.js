#!/usr/bin/env node
'use strict';

/**
 * Module dependencies
 */
const fs = require('fs');
const exec = require('child_process').execSync;
const execAsync = require('child_process').spawn;
const path = require('path');
const xml2js = require('xml2js');

function GetVersion() {
	var pull_request = false;
	var branch = process.env.BUDDYBUILD_BRANCH || process.env.BITRISE_GIT_BRANCH;
	var build_number = process.env.BUDDYBUILD_BUILD_NUMBER || process.env.BITRISE_BUILD_NUMBER || 0;

	var release_version = '0.0';
	//Builds of pull requests
	if(pull_request) {
		release_version = '0.' + pull_request;
	}
	//Builds of branches that aren't master or release
	else if(branch == null || !branch.match(/^release[\/-]/i)) {
		release_version = '0.0';
	}
	//Builds of release branches (or locally or on server)
	else {
		release_version = branch.match(/^release[\/-](\d+(?:\.\d+){0,3})$/i)[1];
	}

	return (release_version + '.' + (build_number == null ? '0' : build_number) + '.0.0.0.0').split('.').slice(0, 3).join('.');
}

var version = GetVersion();
var commander = require('commander');
commander.version(version);

var packageMetadataFile = path.join(__dirname, 'config.xml');
commander
	.command('build')
	.description('Setup require build files for npm package.')
	.action(() => {
		new Promise((s, f) => {
			fs.readFile(packageMetadataFile, (error, data) => error ? f({Error: 'Failed to read config file.', Detail: error}) : s(data));
		}).then(data => {
			return new Promise((s, f) => {
				var parser = new xml2js.Parser({});
				parser.parseString(data, (error, result) => error ? f({Error: 'Failed to parse config file.', Detail: error}) : s(result));
			});
		}).then(config => {
			var name = config.widget['$'].id;
			config.widget['$'].version = version;
			console.log(`Building package ${name} (${version})`);
			return config;
		}).then(config => {
			var builder = new xml2js.Builder({ renderOpts: { 'pretty': true, 'indent': '    ', 'newline': '\n' } });
			var xml = builder.buildObject(config);
			return new Promise((s, f) => {
				// Don't update the config file locally.
				if(!process.env.BUDDYBUILD_BUILD_NUMBER && !process.env.BITRISE_BUILD_NUMBER) { return s('Development Config not updated.'); }
				fs.writeFile(packageMetadataFile, xml, error => error ? f({Error: 'Failed to update config file.', Detail: error}) : s('Updated Config'));
			});
		}).catch(f => console.log(`Failed to run Build: ${f.stack || f.toString()} - ${JSON.stringify(f, null, 2)}`));
	});

commander.on('*', () => {
	if(commander.args.join(' ') == 'tests/**/*.js') { return; }
	console.log('Unknown Command: ' + commander.args.join(' '));
	commander.help();
	process.exit(0);
});
commander.parse(process.argv[2] ? process.argv : process.argv.concat(['build']));
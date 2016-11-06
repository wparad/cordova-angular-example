#!/usr/bin/env node
'use strict';
//
// This hook copies various resource files 
// from our version control system directories 
// into the appropriate platform specific location
//

/* https://cordova.apache.org/docs/en/latest/guide/appdev/hooks/ */

function GetPlatformIcons(appName) {
	return [
		{
			name: 'ios',
			iconSource: 'res/icon_ios_710x710.png',
			iconsPath: `platforms/ios/${appName}/Images.xcassets/AppIcon.appiconset`,
			icons: [
				{ name: 'icon-40.png', size: 40 },
				{ name: 'icon-40@2x.png', size: 80 },
				{ name: 'icon-40@3x.png', size: 120 },
				{ name: 'icon-50.png', size: 50 },
				{ name: 'icon-50@2x.png', size: 100 },
				// { name: 'icon-60.png', size: 60 },
				{ name: 'icon-60@2x.png', size: 120 },
				{ name: 'icon-60@3x.png', size: 180 },
				{ name: 'icon-72.png', size: 72 },
				{ name: 'icon-72@2x.png', size: 144 },
				{ name: 'icon-76.png', size: 76 },
				{ name: 'icon-76@2x.png', size: 152 },
				{ name: 'icon-small.png', size: 29 },
				{ name: 'icon-small@2x.png', size: 58 },
				{ name: 'icon-small@3x.png', size: 87 },
				{ name: 'icon.png', size: 57 },
				{ name: 'icon@2x.png', size: 114 },
				{ name: 'icon-83.5@2x.png', size: 167 }
			],
			splashSource: 'res/splash_1242x2208.png',
			splashPath: `platforms/ios/${appName}/Images.xcassets/LaunchImage.launchimage`,
			splash: [
				// iPhone
				{ name: 'Default~iphone.png', width: 320, height: 480 },
				{ name: 'Default@2x~iphone.png', width: 640, height: 960 },
				{ name: 'Default-568h@2x~iphone.png', width: 640, height: 1136 },
				{ name: 'Default-667h.png', width: 750, height: 1334 },
				{ name: 'Default-736h.png', width: 1242, height: 2208 },
				{ name: 'Default-Landscape-736h.png', width: 2208, height: 1242 },
				// // iPad
				{ name: 'Default-Portrait~ipad.png', width: 768, height: 1024 },
				{ name: 'Default-Portrait@2x~ipad.png', width: 1536, height: 2048 },
				{ name: 'Default-Landscape~ipad.png', width: 1024, height: 768 },
				{ name: 'Default-Landscape@2x~ipad.png', width: 2048, height: 1536 }
			]
		},
		{
			name: 'android',
			iconSource: 'res/icon_android_710x710.png',
			iconsPath: 'platforms/android/res/',
			icons: [
				{ name: 'drawable/icon.png', size: 96 },
				{ name: 'drawable-hdpi/icon.png', size: 72 },
				{ name: 'drawable-ldpi/icon.png', size: 36 },
				{ name: 'drawable-mdpi/icon.png', size: 48 },
				{ name: 'drawable-xhdpi/icon.png', size: 96 },
				{ name: 'drawable-xxhdpi/icon.png', size: 144 },
				{ name: 'drawable-xxxhdpi/icon.png', size: 192 }
			],
			splashSource: 'res/splash_1242x2208.png',
			splashPath: 'platforms/android/res/',
			splash: [
			// 	// Landscape
			// 	{ name: 'drawable-land-ldpi/screen.png', width: 320, height: 200 },
			// 	{ name: 'drawable-land-mdpi/screen.png', width: 480, height: 320 },
			// 	{ name: 'drawable-land-hdpi/screen.png', width: 800, height: 480 },
			// 	{ name: 'drawable-land-xhdpi/screen.png', width: 1280, height: 720 },
			// 	{ name: 'drawable-land-xxhdpi/screen.png', width: 1600, height: 960 },
			// 	{ name: 'drawable-land-xxxhdpi/screen.png', width: 1920, height: 1280 },
			// 	// Portrait
			// 	{ name: 'drawable-port-ldpi/screen.png', width: 200, height: 320 },
			// 	{ name: 'drawable-port-mdpi/screen.png', width: 320, height: 480 },
			// 	{ name: 'drawable-port-hdpi/screen.png', width: 480, height: 800 },
			// 	{ name: 'drawable-port-xhdpi/screen.png', width: 720, height: 1280 },
			// 	{ name: 'drawable-port-xxhdpi/screen.png', width: 960, height: 1600 },
			// 	{ name: 'drawable-port-xxxhdpi/screen.png', width: 1280, height: 1920 }
			]
		},
		{
			//Browser paths in www get overwritten, so they aren't there later. :(
			name: 'browser',
			iconSource: 'res/icon_android_710x710.png',
			iconsPath: 'platforms/browser/www/img',
			icons: [
				{ name: 'logo.png', size: 180 },
			],
			splashSource: 'res/splash_1242x2208.png',
			splashPath: 'platforms/browser/www/images/browser',
			splash: [
				// { name: 'splashscreen.jpg', width: 1920, height: 1280 },
			]
		}
		// {
		// 	name: 'windows',
		// 	iconSource: 'res/icon_ios_710x710.png',
		// 	iconsPath: 'platforms/windows/images/',
		// 	icons: [
		// 		{ name: 'StoreLogo.scale-100.png', size: 50 },
		// 		{ name: 'StoreLogo.scale-125.png', size: 63 },
		// 		{ name: 'StoreLogo.scale-150.png', size: 75 },
		// 		{ name: 'StoreLogo.scale-200.png', size: 100 },
		// 		{ name: 'StoreLogo.scale-400.png', size: 200 },

		// 		{ name: 'Square44x44Logo.scale-100.png', size: 44 },
		// 		{ name: 'Square44x44Logo.scale-125.png', size: 55 },
		// 		{ name: 'Square44x44Logo.scale-150.png', size: 66 },
		// 		{ name: 'Square44x44Logo.scale-200.png', size: 88 },
		// 		{ name: 'Square44x44Logo.scale-400.png', size: 176 },

		// 		{ name: 'Square71x71Logo.scale-100.png', size: 71 },
		// 		{ name: 'Square71x71Logo.scale-125.png', size: 89 },
		// 		{ name: 'Square71x71Logo.scale-150.png', size: 107 },
		// 		{ name: 'Square71x71Logo.scale-200.png', size: 142 },
		// 		{ name: 'Square71x71Logo.scale-400.png', size: 284 },

		// 		{ name: 'Square150x150Logo.scale-100.png', size: 150 },
		// 		{ name: 'Square150x150Logo.scale-125.png', size: 188 },
		// 		{ name: 'Square150x150Logo.scale-150.png', size: 225 },
		// 		{ name: 'Square150x150Logo.scale-200.png', size: 300 },
		// 		{ name: 'Square150x150Logo.scale-400.png', size: 600 },

		// 		{ name: 'Square310x310Logo.scale-100.png', size: 310 },
		// 		{ name: 'Square310x310Logo.scale-125.png', size: 388 },
		// 		{ name: 'Square310x310Logo.scale-150.png', size: 465 },
		// 		{ name: 'Square310x310Logo.scale-200.png', size: 620 },
		// 		{ name: 'Square310x310Logo.scale-400.png', size: 1240 },

		// 		{ name: 'Wide310x150Logo.scale-100.png', size: 310, height: 150 },
		// 		{ name: 'Wide310x150Logo.scale-125.png', size: 388, height: 188 },
		// 		{ name: 'Wide310x150Logo.scale-150.png', size: 465, height: 225 },
		// 		{ name: 'Wide310x150Logo.scale-200.png', size: 620, height: 300 },
		// 		{ name: 'Wide310x150Logo.scale-400.png', size: 1240, height: 600 }
		// 	],
		// 	splashSource: 'res/splash_1242x2208.png',
		// 	splashPath: 'platforms/windows/images/',
		// 	splash: [
		// 		{ name: 'SplashScreen.scale-100.png', width: 620, height: 300 },
		// 		{ name: 'SplashScreen.scale-125.png', width: 775, height: 375 },
		// 		{ name: 'SplashScreen.scale-150.png', width: 930, height: 450 },
		// 		{ name: 'SplashScreen.scale-200.png', width: 1240, height: 600 },
		// 		{ name: 'SplashScreen.scale-400.png', width: 2480, height: 1200 }
		// 	]
		// }
	];
};

const fs = require('fs-extra');
const path = require('path');
const Parser = require('xml2js').Parser;
var sharp = require('sharp');

module.exports = function(context) {
	var platforms = context.opts.cordova.platforms.length == 0 ? Object.keys(require('../platforms/platforms.json')) : context.opts.cordova.platforms;

	var projectRoot = context.opts.projectRoot;
	var configPath = path.join(projectRoot, 'config.xml');
	var parser = new Parser();
	var appNamePromise = new Promise((s, f) => fs.readFile(configPath, (error, data) => error ?	f({Error: 'Failed to read config file.', Detail: error}) : s(data)))
	.then(configString => new Promise((s, f) => parser.parseString(configString, (error, result) => error ?	f({Error: 'Failed to parse config file.', Detail: error}) : s(result))))
	.then(config => config.widget.name[0]);
	var hookPromise = appNamePromise.then(appName => {
		var iconPromise = Promise.all(GetPlatformIcons(appName)
			.filter(p => fs.existsSync(path.join('platforms', p.name)) && platforms.some(l => p.name == l)).map(platform => {
			return platform.icons.reduce((listPromise, next) => {
				var copyPath = path.join(platform.iconsPath, next.name);
				var copyPromise = new Promise((s, f) => fs.mkdirs(path.dirname(copyPath), error => error ? f(`Issue Creating directory for ${copyPath}`) : s(`Setup Success`)))
				.then(() => sharp(platform.iconSource).resize(next.size, next.size).toFile(copyPath));

				var result = Promise.all([listPromise, copyPromise]).then(result => Promise.resolve(result[0].concat([copyPath])));
				return result;
			}, Promise.resolve([]));
		}));
		var splashPromise = Promise.all(GetPlatformIcons(appName)
			.filter(p => fs.existsSync(path.join('platforms', p.name)) && platforms.some(l => p.name == l)).map(platform => {
			return platform.splash.reduce((listPromise, next) => {
				var copyPath = path.join(platform.splashPath, next.name);
				var copyPromise = new Promise((s, f) => fs.mkdirs(path.dirname(copyPath), error => error ? f(`Issue Creating directory for ${copyPath}`) : s(`Setup Success`)))
				.then(() => sharp(platform.splashSource).resize(next.width, next.height).toFile(copyPath));

				var result = Promise.all([listPromise, copyPromise]).then(result => Promise.resolve(result[0].concat([copyPath])));
				return result;
			}, Promise.resolve([]));
		}));
		return Promise.all([iconPromise, splashPromise]).then(result => result[0].concat(result[1]));
	});
	hookPromise
	.then(files => console.log(JSON.stringify({Info: 'Files copied by hook', Hook: __filename, Files: files}, null, 2)))
	.catch(failure => console.log(JSON.stringify({Info: 'Failed to copy files', Hook: __filename, Failure: failure}, null, 2)));
	return hookPromise;
};
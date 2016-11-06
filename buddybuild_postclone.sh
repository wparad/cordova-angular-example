#!/usr/bin/env bash
#http://docs.buddybuild.com/docs/adding-cordova-apps

set -e

if [ -f /Users/buddybuild/workspace ]; then
	cd /Users/buddybuild/workspace
fi
echo '*************************************************************************************************'
echo '****************************** buddybuild_postclone.sh Information ******************************'
echo '*************************************************************************************************'
echo '=== PLATFORM is: ' $PLATFORM ' ==='
echo "node location: $(which node) ($(node -v))"

echo '=== Start to run : npm install'
npm install -g npm
echo "npm location: $(which npm) ($(npm -v))"
npm install -g cordova
npm install --unsafe-perm

echo '=== Start to run : cordova add platforms'
cordova platform add ${PLATFORM:-android} -d

### Because BuddyBuild says so and it doesn't work without it, why these need to be specifically copied is beyond me.
if [ "${PLATFORM}x" == "androidx" ]; then
	echo '=== Start to run : cp buddybuild_prebuild to android platform'
	cp ./buddybuild_prebuild.sh ./platforms/android
	echo '=== Start to run : cp ./build_extra.gradle to android platform'
	cp ./build-extras.gradle ./platforms/android || echo 'Not gradle extras defined: build-extras.gradle'

	if hash android 2>/dev/null; then
		echo '=== Detected android command, run android list sdk --all'
		android list sdk --all
	fi
	cordova prepare android -d
elif [ "${PLATFORM}x" == "iosx" ]; then
	npm install -g ios-deploy || echo "Cannot build iOS apps on this build machine."
	echo '=== Detected environmental variable PLATFORM is set:' $PLATFORM
	cordova prepare ios -d
	echo '=== Start to run : cp buddybuild_prebuild to ios platform'
	cp ./buddybuild_prebuild.sh ./platforms/ios || (echo 'Could not copy buddybuild_prebuild file' && exit 1)
else
	echo '$PLATFORM not defined, will not prepare any buddybuild_prebuild steps.'

fi

echo '=== Start to run : cordova check requirements'
cordova requirements -d || echo 'Some requirements missing, but will proceed anyway.'

echo '=== Start to run : $(env)'
env
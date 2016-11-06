# GolfPro
This is an example angular cordova app for android and ios.  To see the server side (AWS hosted), take a look at the [Cordova Serverless Example](https://github.com/wparad/cordova-serverless-example).
## License

All Rights Reserved, [Full License](http://www.binpress.com/license/view/l/f9f510d68afb82d8c2bbfb2c07098b61)

## Development

### Setup:

* `sudo android sdk`: install all additional android maven repositories.
* `cordova platform add android --save`
* [Optional] Create CI scripts.
* Setup Google developer account & add app
* Sign the resultant installers apks using the [keytool](http://stackoverflow.com/questions/26449512/how-to-create-signed-apk-file-using-cordova-command-line-interface).
	* `keytool -genkey -v -keystore mobileapps.keystore -alias mobileapps -keyalg RSA -keysize 2048 -validity 10000`
	* `keytool -importkeystore -srckeystore mobileapps.keystore -destkeystore mobileapps.p12 -srcstoretype JKS -deststoretype PKCS12 -srcalias mobileapps -destalias mobileapps`: may not work and requires [manual process](http://docs.buddybuild.com/docs/uploading-certificates-manually).
* [S3 bucket](https://console.aws.amazon.com/s3/home?region=us-east-1&bucket=golfpro-729379526210&prefix=)
* Setup Facebook, use the key to generate the [release android hash](https://developers.facebook.com/docs/android/getting-started#release-key-hash).
	* Add the [debug hash](https://developers.facebook.com/docs/android/getting-started#samples) by running: `keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64`
* Setup AWS (generate the service user and cognito pool) to point to Facebook.
* Push Notifications
	* [Google Firebase](https://console.firebase.google.com/)
	* [AWS SNS](https://console.aws.amazon.com/sns/v2/home?region=us-east-1#/topics/arn:aws:sns:us-east-1:XXXXXX:GolfPro)
* [Create a spinner](http://www.chimply.com/Generator#classic-spinner,loopingCircle)

## Testing
[see also](https://www.raymondcamden.com/2016/03/22/the-cordova-browser-platform/) on using cordova browser.

* On Browser:
	* `cordova platform add browser`
	* `cordova run browser`
	* trackchanges automatically: `filewatcher "www/**/*.*" "cordova prepare"` [filewatcher](https://github.com/thomasfl/filewatcher)
* On Android:
	* `android sdk && android avd` to setup android locally
	* `cordova platform add android --save`
	* `adb devices`
	* `cordova run android`
	* `adb logcat | grep chromium`
* On iOS:
	* `cordova platform add ios --save`
	* `cordova run ios`
	* Safari > Develop > Simulator (or Device) > index.html

Color Set: [Color Picker](http://www.perbang.dk/rgb/ADFFE5/)

* #FFAB23 Dark Orange (Alt: #E89F10)
* #D48200 Dark Dark Orange
* #FFEC64 Light Light Orange

Disabled:
* #989288 Border Light Grey
* #989288 Background Light Grey

## Golf Courses:

* [US Golf Courses](http://www.pga.com/golf-courses/details)
* [Golf Course long and lat](http://www.distancesfrom.com/Latitude-Longitude.aspx)
* [ScoreCards](http://www.oobgolf.com/courses/)

## TODO

[Trello Board](https://trello.com/b/iLglMJQy/golfpro)
* [Programatic Phone screen lock](https://github.com/cogitor/PhoneGap-OrientationLock)

## Troubleshooting

* Build server complains that "Your Apple ID or password was entered incorrectly. (-20101)" Checkout [this problem](https://github.com/fastlane/fastlane/issues/39)
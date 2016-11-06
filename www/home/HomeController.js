angular.module(GOLFPRO).config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/home', { templateUrl: 'home/home.html', controller: 'homeController' });
}]);
angular.module(GOLFPRO).factory('authCache', function(){
	return Promise.reject('No Cache');
});
angular.module(GOLFPRO).controller('homeController', ['$scope', '$rootScope', 'loginStatusProvider', 'guiManager', 'pushService', 'pageService', 'authCache', 'userManager', 'eventHandler',
function($scope, $rootScope, loginStatusProvider, guiManager, pushService, pageService, authCache, userManager, eventHandler) {
	// AdMob.setOptions({
	// 	adSize: 'CUSTOM',
	// 	width: 360, // valid when set adSize 'CUSTOM'
	// 	height: 90, // valid when set adSize 'CUSTOM'
	// 	position: AdMob.AD_POSITION.BOTTOM_CENTER,
	// 	// x: 0,       // valid when set position to POS_XY
	// 	// y: 0,       // valid when set position to POS_XY
	// 	isTesting: true,
	// 	autoShow: true
	// });
	// AdMob.prepareInterstitial({
	// 	adId: 'ca-app-pub-1233157797225623/2051029457',
	// 	autoShow: false
	// });
	document.addEventListener('onAdDismiss', function(){
		// AdMob.prepareInterstitial({
		// 	adId: 'ca-app-pub-1233157797225623/2051029457',
		// 	autoShow: false
		// });
	});

	//Returning to the home screen happens often, so unless there is a failure with the last validation attempt, or the last push id update, don't bother relogging in.
	authCache = authCache.catch(function(){ return Promise.all([loginStatusProvider.validateAuthenticationPromise(), pushService.Configure()]); });
	authCache.catch(function(error){
		console.log(JSON.stringify({Title: 'Issues authenticating', Error: error.stack || error.toString(), Detail: error}, null, 2));
		guiManager.toast('Trouble connecting to peers, internet connection issue.', 2000, 'center');
		pageService.NavigateToPage('/');
	});
	$scope.startGameButtonClick = function() {
		pageService.NavigateToPage('game');
	};

	$scope.newsButtonClick = function() {
		pageService.NavigateToPage('news');
	};

	$scope.competitionButtonClick = function() {
		pageService.NavigateToPage('competition');
	};

	$scope.profileButtonClick = function() {
		pageService.NavigateToPage('profile');
	};

	$scope.shareButtonClick = function() {
		var userIdPromise = userManager.GetUserIdPromise();
		userIdPromise
		.then(function(userId) {
			return {
				message: 'Invite to GolfPro', // not supported on some apps (Facebook, Instagram)
				subject: 'Join my game', // fi. for email
				//files: ['', ''], // an array of filenames either locally or remotely
				url: 'https://bit.ly/golfproapp', //?source=' + encodeURIComponent(userId),
				chooserTitle: 'Choose an app' // Android only, you can override the default share sheet title
			};
		})
		.then(function(options) {
			return new Promise(function(s, f){
				if(!device.platform.match(/browser/i)) { window.plugins.socialsharing.shareWithOptions(options, s, f); }
				else { return Promise.reject('Browser unsported share: ' + JSON.stringify(options)); }
			})
			.then(function(result){
				console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
				console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
				guiManager.toast('Invite Sent', 1000, 'bottom');
				return userIdPromise
				.then(function(userId) {
					eventHandler.log('Share', { User: userId, Detail: result });
				});
			});
		}, function(failure){
			console.log(JSON.stringify({Title: 'Failed to share', Error: failure.stack || failure.toString(), Detail: failure}, null, 2));
			guiManager.toast('Invite failed.', 1000, 'bottom');
		});
	};
	$scope.$on("$routeChangeSuccess", function($currentRoute, $previousRoute) {

	});
}]);
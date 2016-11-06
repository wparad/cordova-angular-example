angular.module(GOLFPRO).config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/item/:itemId?', { templateUrl: 'news/item.html', controller: 'itemController' });
}]);

angular.module(GOLFPRO).controller('itemController', ['$scope', '$routeParams', 'ngDialog', 'guiManager', 'pageService', 'userManager', 'newsCache',
function($scope, $routeParams, ngDialog, guiManager, pageService, userManager, newsCache) {
	if(AdMob) {
		AdMob.createBanner({
			adId: 'ca-app-pub-1233157797225623/8590417450',
			adSize: 'CUSTOM',
			width: window.innerWidth || document.documentElement.clientWidth,
			height: 50,
			// isTesting: true,
			autoShow: true
		});
	}

	setTimeout(function() {
		$scope.$apply(function() { $scope.Item = newsCache.Item; });
		AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);
	}, 200);
	$scope.Feed = newsCache.Feed;

	$scope.RedirectInProgress = false;
	$scope.ReadInBrowserClick = function() {
		if($scope.RedirectInProgress) { return; }
		$scope.RedirectInProgress = true;
		// AdMob.showInterstitial();
		setTimeout(function(){
			cordova.InAppBrowser.open($scope.Item.Url, '_system', 'location=no');
			$scope.$apply(function(){ $scope.RedirectInProgress = false; });
		}, 100);
	};
}]);
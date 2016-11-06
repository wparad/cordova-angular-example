angular.module(GOLFPRO).config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/news', { templateUrl: 'news/news.html', controller: 'newsController' });
}]);
angular.module(GOLFPRO).factory('newsCache', function(){
	return {};
});
angular.module(GOLFPRO).controller('newsController', ['$scope', '$routeParams', '$window', 'ngDialog', 'guiManager', 'pageService', 'storageProviderService', 'feedService', 'newsCache',
function($scope, $routeParams, $window, ngDialog, guiManager, pageService, storageProviderService, feedService, newsCache) {
	// GOOGLE ADMOB
	if(AdMob) {
		// AdMob.createBanner({
		// 	adId: 'ca-app-pub-1233157797225623/8590417450',
		// 	adSize: 'CUSTOM',
		// 	width: window.innerWidth || document.documentElement.clientWidth,
		// 	height: 50,
		// 	// isTesting: true,
		// 	autoShow: false
		// });
		// document.addEventListener('touchstart', function(){
		// 	//AdMob.hideBanner();
		// })
		// document.addEventListener('touchend', function(){
		// 	[].slice.call(document.getElementsByName("nativead")).map(function(ad){
		// 		var rect = ad.getBoundingClientRect()
		// 		console.log('Setting facebook Ad ***************************** ${rect.bottom}, ${rect.top}, ${rect.left}, ${rect.right}'');
		// 		if(rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)) {
		// 				//AdMob.showBannerAtXY(rect.left, rect.top);
		// 		}
		// 	});
		// });
	}
	var storageProvider = storageProviderService.GetStorageProvider('newsController');
	$scope.CachedSelectedFeeds = storageProvider.Get('feeds');
	$scope.SelectedItems = storageProvider.Get('items') || {};
	var feedsPromise = feedService.GetFeedsPromise();

	$scope.ViewItem = function(item) {
		$scope.SelectedItems[item.Id] = true;
		storageProvider.Save('items', $scope.SelectedItems);
		feedsPromise.then(function(feeds){
			newsCache.Item = item;
			newsCache.Feed = feeds.find(function(feed) { return feed.Id == item.FeedId; });
			pageService.NavigateToPage('/item');
		});
	};
	$scope.RemoveItemButtonClick = function(itemId) {
		$scope.Items.splice($scope.Items.findIndex(function(item) { return item.Id == itemId; }), 1);
	};
	$scope.FilterButtonClick = function() {
		return ngDialog.open({
			scope: $scope,
			closeByNavigation: true,
			width: 300,
			template: 'news/filterRss.html',
			resolve: {
				feeds: function() { return feedsPromise; }
			},
			controller: ['$scope', 'feeds', function($scope, feeds) {
				$scope.Feeds = feeds.map(function(feed){
					var newFeed = feed;
					newFeed.Selected = $scope.$parent.CachedSelectedFeeds ? $scope.$parent.CachedSelectedFeeds[feed.Id] : true;
					return newFeed;
				}).sort(function(a, b){
					return a.Selected != b.Selected ? b.Selected - a.Selected : a.Name < b.Name ? -1 : a.Name === b.Name ? 0 : 1;
				});
				$scope.CloseClick = function(ok) {
					var selectedFeeds = $scope.Feeds.filter(function(feed){ return feed.Selected; }).map(function(feed){ return feed.Id; });
					$scope.closeThisDialog(selectedFeeds);
				};
			}],
			className: 'ngdialog-theme-default'
		}).closePromise.then(function(dialogResult){
			console.log(JSON.stringify(dialogResult, null, 2));
			var isarray = Object.prototype.toString.call(dialogResult.value) === '[object Array]';
			if(!isarray) { return; }
			var map = {};
			dialogResult.value.map(function(feedId) { map[feedId] = true; });
			storageProvider.Save('feeds', map);
			$scope.CachedSelectedFeeds = map;
			$scope.RefreshButtonClick();
		});
	};

	$scope.RefreshButtonClick = function() {
		feedsPromise
		.then(function(feeds){
			var feedDictionary = {};
			feeds.map(function(feed){ feedDictionary[feed.Id] = feed; });
			if($scope.CachedSelectedFeeds) {
				Object.keys($scope.CachedSelectedFeeds).map(function(possibleFeed){
					if(!feedDictionary[possibleFeed]) { delete $scope.CachedSelectedFeeds[possibleFeed]; }
				});
			}
			feedService.GetItemsForFeeds(Object.keys($scope.CachedSelectedFeeds || feedDictionary))
			.then(function(items){
				$scope.$apply(function() {
					var newSelectedItemsDictionary = {};
					var tmpItems = items.filter(function(item){
						return $scope.CachedSelectedFeeds ? $scope.CachedSelectedFeeds[item.FeedId] : true;
					}).map(function(item){
						var newItem = item;
						newSelectedItemsDictionary[item.Id] = $scope.SelectedItems[item.Id];
						newItem.IconSource = feedDictionary[item.FeedId].IconSource;
						newItem.Icon = feedDictionary[item.FeedId].Icon;
						newItem.ItemStyle = $scope.SelectedItems[item.Id] ? { color: 'grey' } : { color: 'black' };
						newItem.HeadlineShort = item.Headline.length > 37 ? item.Headline.slice(0, 34) + '...' : item.Headline;
						newItem.TitleShort = item.Title.length > 40 ? item.Title.slice(0, 37) + '...' : item.Title;
						newItem.Date = Date.parse(item.Date.replace('BST', 'GMT+0100'));
						newItem.Ad = false;
						return newItem;
					}).sort(function(a, b) { return b.Date - a.Date; });
					// var jump = 8;
					// for(var index = 0; index < Math.floor(tmpItems.length/jump); index++) {
					// 	tmpItems.splice((index + 1)*jump - 1, 0, { Ad: true });
					// }
					newsCache.Items = $scope.Items = tmpItems;
					$scope.SelectedItems = newSelectedItemsDictionary;
					// AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);
				});
			});
		})
		.catch(function(failure){
			console.error(JSON.stringify({Title: 'Failed to refresh feeds.', Error: failure.stack || failure.toString(), Detail: failure}, null, 2));
		});
	};
	if(newsCache.Items) {
		$scope.Items = newsCache.Items;
		// AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);
	}
	else { $scope.RefreshButtonClick(); }

	// FACEBOOK ADS
	// if(window.cordova && window.cordova.platformId !== 'browser') {
	// 	new Promise(function(s, f) {
	// 		return FacebookAds.createNativeAd('1141557832563745_1190327884353406', s, f);
	// 	})
	// 	.then(function(s) {console.log(s); })
	// 	.catch(function(s) { console.error(s); });

	// 	var nativeId = null;
	// 	var updateClickArea = function() {
	// 		if(nativeId) {
	// 			[].slice.call(document.getElementsByName("nativead")).map(function(ad){
	// 				var rect = ad.getBoundingClientRect()
	// 				console.log('Setting facebook Ad ***************************** ${rect.bottom}, ${rect.top}, ${rect.left}, ${rect.right}'');
	// 				if(rect.top >= 0 && rect.left >= 0 &&
	// 					rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
	// 					rect.right <= (window.innerWidth || document.documentElement.clientWidth)) {
	// 						FacebookAds.setNativeAdClickArea(nativeId, rect.left, rect.top, rect.width, rect.height);
	// 				}
	// 			});
	// 		}
	// 	};

	// 	$window.onscroll = function(){ updateClickArea(); };
	// 	document.addEventListener('onAdLoaded',function(data) {
	// 		if (data.adType == "native") {
	// 			$scope.$apply(function(){
	// 				console.log('URL: *************** ${data.adRes.icon.url}'');
	// 				$scope.Ad = data.adRes;
	// 			});
	// 			nativeId = data.adId;
	// 			updateClickArea();
	// 		}
	// 	});
	//}
}]);
angular.module(GOLFPRO).service('feedService', ['apiService', function(apiService) {
	this.GetFeedsPromise = function() {
		return apiService.getPromise('GET', '/feeds', {}).then(function(data) { return data.feeds; });
	};
	this.GetItemsForFeeds = function(feedIds) {
		return apiService.getPromise('GET', '/feed-items', {
			feeds: feedIds
		}).then(function(data) { return data.items; });
	};
}]);
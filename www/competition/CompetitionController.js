angular.module(GOLFPRO).config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/competition', { templateUrl: 'competition/competition.html', controller: 'competitionController' });
}]);
angular.module(GOLFPRO).controller('competitionController', ['$scope', '$location', 'userManager', 'guiManager', 'pageService', 'eventHandler',
function($scope, $location, userManager, guiManager, pageService, eventHandler) {
	userManager.GetUserIdPromise().then(function(userId){
		$scope.$apply(function() {
			$scope.currentUserId = userId;
		});
	});
	var friendsChangedMap = {};
	var friendsPromise = userManager.GetFriends();
	$scope.users = [];
	var newFriends = [];
	var searchCache = {};
	$scope.filterFunction = function(user) {
		return !$scope.userSearchText ||
			user.Info && user.Info.Name && user.Info.Name.slice(0, $scope.userSearchText.length).toLowerCase() === $scope.userSearchText.toLowerCase() ||
			user.Info && user.Info.ShortName && user.Info.ShortName.slice(0, $scope.userSearchText.length).toLowerCase() === $scope.userSearchText.toLowerCase();
	};
	$scope.RemoveFriend = function(userId) {
		friendsChangedMap[userId] = 'X';
		userManager.RemoveFriend(userId)
		.then(function(){
			$scope.$apply(function(){
				$scope.users.find(function(user){
					return user.UserId == userId;
				}).IsFriend = false;
			});
		})
		.catch(function(failure){
			console.error(JSON.stringify({Title: 'Failed to add friend', Error: failure.stack || failure.toString(), Detail: failure}, null, 2));
			guiManager.toast('Competition update unsuccessful.', 1000, 'bottom');
		});
	};
	$scope.AddFriend = function(userId) {
		friendsChangedMap[userId] = 'O';
		var user = $scope.users.find(function(user){ return user.UserId == userId; });
		newFriends.push(user);
		userManager.AddFriend(userId)
		.then(function(){
			$scope.$apply(function(){
				user.IsFriend = true;
			});
		})
		.catch(function(failure){
			console.error(JSON.stringify({Title: 'Failed to add friend', Error: failure.stack || failure.toString(), Detail: failure}, null, 2));
			guiManager.toast('Competition update unsuccessful.', 1000, 'bottom');
		});
	};

	var lastSearchedString = null;
	$scope.searchBoxChanged = function() {
		lastSearchedString = $scope.userSearchText;
		if(!lastSearchedString || lastSearchedString.length === 0) {
			friendsPromise
			.then(function(friends) {
				var updateDict = {};
				newFriends.concat(friends).filter(function(user){ return friendsChangedMap[user.UserId] != 'X'; }).map(function(user){
					var newUser = user;
					newUser.IsFriend = true;
					updateDict[newUser.UserId] = newUser;
				});
				$scope.$apply(function() {
					$scope.users = Object.keys(updateDict).map(function(key){ return updateDict[key]; });
				});
				return null;
			}, function(failure){
				switch (failure.Detail.code) {
					case 'NetworkingError':
						guiManager.toast('Trouble connecting to peers, internet connection issue.', 2000, 'center');
						break;
					default:
						guiManager.toast('Failed to look up competition', 1000, 'center');
				}
				console.error(JSON.stringify({Title: 'Failed to lookup competition.', Error: failure.stack || failure.toString(), Detail: failure}, null, 2));
				return null;
			});
		}
		else if(lastSearchedString && lastSearchedString.length >= 1) {
			var searchString = lastSearchedString.slice(0, 1).toLowerCase();
			searchCache[searchString] = searchCache[searchString] || userManager.SearchUsers(searchString);

			//purposely reset to the latest thing that has been searched.
			var allUsersPromise = $scope.userSearchText && $scope.userSearchText.length > 1 ? searchCache[$scope.userSearchText.slice(0, 1).toLowerCase()] : searchCache[searchString];
			var friendsMapPromise = friendsPromise
			.then(function(friends){
				var map = {};
				friends.filter(function(user){ return friendsChangedMap[user.UserId] != 'X'; }).map(function(user){ map[user.UserId] = true; });
				return map;
			});
			return Promise.all([allUsersPromise, friendsMapPromise])
			.then(function(result) {
				var users = result[0];
				var friendMap = result[1];
				$scope.$apply(function() {
					$scope.users = users.map(function(user){
						var newUser = user;
						newUser.IsFriend = friendMap[newUser.UserId] || false;
						return newUser;
					});
				});
				return null;
			}, function(failure){
				console.error(JSON.stringify({Title: 'Failed to lookup competition.', Error: failure.stack || failure.toString(), Detail: failure}, null, 2));
				guiManager.toast('Failed to look up competition', 1000, 'center');
				return null;
			});
		}
	};
	$scope.searchBoxChanged();
	$scope.ProfileButtonClick = function(userId) {
		pageService.NavigateToPage('profile/' + userId);
	};

	$scope.ShareButtonClick = function() {
		Promise.resolve()
		.then(function() {
			return {
				message: 'Invite to GolfPro', // not supported on some apps (Facebook, Instagram)
				subject: 'Join my game', // fi. for email
				//files: ['', ''], // an array of filenames either locally or remotely
				url: 'https://bit.ly/golfproapp', //?source=' + encodeURIComponent($scope.currentUserId),
				chooserTitle: 'Invite to GolfPro' // Android only, you can override the default share sheet title
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
				return eventHandler.log('Share', { User: $scope.currentUserId, Detail: result });
			});
		}, function(failure){
			console.log(JSON.stringify({Title: 'Failed to share', Error: failure.stack || failure.toString(), Detail: failure}, null, 2));
			guiManager.toast('Invite failed.', 1000, 'bottom');
		});
	};
}]);
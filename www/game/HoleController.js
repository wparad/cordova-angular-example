angular.module(GOLFPRO).config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/hole/:holeId?', { templateUrl: 'game/hole.html', controller: 'holeController' });
}]);
angular.module(GOLFPRO).controller('holeController', ['$scope', '$routeParams', 'ngDialog', 'gameCacheService', 'guiManager', 'courseProvider',
	'gameManager', 'pageService', 'userManager', 'pushService', 'multiplayerGameUpdateQueue',
function($scope, $routeParams, ngDialog, gameCacheService, guiManager, courseProvider, gameManager, pageService, userManager, pushService, multiplayerGameUpdateQueue) {
	var cachedGame = gameCacheService.GetGame();
	$scope.game = cachedGame;
	$scope.hole = {
		currentHoleNumber: 1
	};
	userManager.GetUserIdPromise()
	.then(function(userId){
		$scope.$apply(function(){
			$scope.CurrentUserId = userId;
			$scope.hole.currentHoleNumber = $routeParams.holeId === 'last' ? $scope.game.holes.length : 1;
		});
	});
	var inProgressSave = false;
	$scope.strokesChanged = function() {
		gameCacheService.SaveGame($scope.game);
		if(inProgressSave) { return; }
		inProgressSave = true;
		setTimeout(function() {
			inProgressSave = false;
			cordova.plugins.Keyboard.close();
			var currentUser = $scope.game.users.find(function(user){ return user.UserId === $scope.CurrentUserId; });
			gameManager.saveInProgressGame($scope.game.gameId, currentUser.Strokes)
			.then(function(saveResult) {
				console.log('Save Result: ' + saveResult.toString() + ' - ' + JSON.stringify(saveResult, null, 2));
				return saveResult;
			}).catch(function(failure){
				console.error(JSON.stringify({Title: 'Failed to save in progress game', Error: failure.stack || failure.toString(), Detail: failure}, null, 2));
			});
		}, 1200);
	};
	$scope.strokeComparator = function(userStrokesA, userStrokesB){
		if(!userStrokesA && !userStrokesB) { return 0; }
		if(!userStrokesA) { return 1; }
		if(!userStrokesB) { return -1; }
		if(userStrokesA.type === 'number' && userStrokesB.type === 'number') { return userStrokesA.value - userStrokesB.value; }
		var maxCompare = Math.min(Object.keys(userStrokesA.value).length, Object.keys(userStrokesB.value).length);
		var conditionalSum = function(dict, length){
			return Object.keys(dict).reduce(function(t, n){ return t + (n <= length && dict[n] ? dict[n] : 0); }, 0);
		};
		return conditionalSum(userStrokesA.value, maxCompare) - conditionalSum(userStrokesB.value, maxCompare);
	};
	$scope.NormalizeUser = function(user) {
		function getNumericValue(n){ return !isNaN(parseFloat(n)) && isFinite(n) ? n : 0; }
		return {
			Total: Object.keys(user.Strokes).reduce(function(t, n) { return t + getNumericValue(user.Strokes[n]); }, 0),
			TotalDiff: Object.keys(user.Strokes).reduce(function(t, n) {
				return t + getNumericValue(user.Strokes[n]) - (getNumericValue(user.Strokes[n]) > 0 ? $scope.game.course.par[n] : 0);
			}, 0)
		};
	};

	$scope.NextHoleClick = $scope.SwipeLeft = function() {
		//var enteredValue = $scope.game.users.find(function(user){ return user.UserId === $scope.CurrentUserId; }).Strokes[$scope.hole.currentHoleNumber];
		// if(!enteredValue || isNaN(parseFloat(enteredValue))) {
		// 	guiManager.toast('Enter a valid stroke count.', 1000, 'center');
		// 	return;
		// }
		if($scope.hole.currentHoleNumber === Object.keys($scope.game.course.par).length) { pageService.GoBackPage(); }
		else { $scope.hole.currentHoleNumber++; }
	};
	$scope.PreviousHoleClick = $scope.SwipeRight = function() {
		if($scope.hole.currentHoleNumber === 1) { pageService.GoBackPage(); }
		else { $scope.hole.currentHoleNumber--; }
	};
	$scope.RefreshButtonClick = function() {
		multiplayerGameUpdateQueue.GameUpdatePromise($scope, 0);
	};
}]);
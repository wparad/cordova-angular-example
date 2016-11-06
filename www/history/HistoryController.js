angular.module(GOLFPRO).filter('millisecondsToDateTime', [function() {
	return function(epochTime) { return new Date(epochTime).toLocaleString(); };
}]);

angular.module(GOLFPRO).factory('historyService', function(){
	return {
		games: []
	};
});
angular.module(GOLFPRO).config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/history', { templateUrl: 'history/history.html', controller: 'historyController' });
}]);
angular.module(GOLFPRO).controller('historyController', ['$scope', '$location', 'historyService', 'gameManager', 'courseProvider', 'guiManager', 'pageService',
function($scope, $location, historyService, gameManager, courseProvider, guiManager, pageService) {
	historyService.games = [];
	var gamePageSize = 10;
	var getAdditionalGames = function(gamesBeforeDate) {
		var additionalGamesPromise = gameManager.getGames(gamesBeforeDate, gamePageSize)
		.then(function(gameInfo) {
			historyService.games = historyService.games.concat(gameInfo.games);
			historyService.totalGames = gameInfo.total;
		});
		additionalGamesPromise.catch(function(failure) {
			console.log(failure);
			console.log(JSON.stringify({Error: 'Failed to retrieve recent games.', Detail: failure}, null, 2));
			guiManager.toast('Failed to retrieve recent games.', 1000, 'center');
		});
		return additionalGamesPromise;
	};
	var changePage = function(pageId) {
		console.log('pageId: ' + pageId);
		var gamesToShow = historyService.games.slice(pageId * gamePageSize, (pageId + 1) * gamePageSize - 1);
		$scope.$apply(function() {
			$scope.historyPage = pageId;
			$scope.previousHistoryPageButtonClass = pageId === 0 ? 'button-disabled' : 'button-enabled';
			$scope.nextHistoryPageButtonClass = gamesToShow.length + pageId * gamePageSize >= historyService.totalGames ? 'button-disabled' : 'button-enabled';
		});

		return gamesToShow.reduce(function(listPromise, game) {
			return listPromise.then(function(list) {
				return courseProvider.getCourseDataPromise(game.CourseId)
				.then(function(course) {
					var mappedGame = {
						GameId: game.GameId,
						Course: course.name,
						Date: game.CompletionTime,
						TotalStrokes: Object.keys(game.Strokes).reduce(function(total, hole) {return total + game.Strokes[hole] || 0; }, 0)
					};
					return Promise.resolve(list.concat([mappedGame]));
				});
			});
		}, Promise.resolve([]))
		.then(function(games) {
			$scope.$apply(function() {
				$scope.games = games;
			});
		});
	};

	$scope.viewGame = function(selectedGame) {
		historyService.selectedGameId = selectedGame.GameId;
		pageService.NavigateToPage('game-review');
	};

	var today = new Date().getTime();
	getAdditionalGames(today).then(function() { changePage(0); });
	$scope.previousHistoryPageButtonClick = function() {
		if($scope.previousHistoryPageButtonClass == 'button-enabled') {
			//Change page has a $scope.$apply in it, so we have to call it from a promise context or else angular will throw an exception.
			Promise.resolve().then(function() {changePage(Math.max(0, $scope.historyPage - 1)); });
		}
	};
	$scope.nextHistoryPageButtonClick = function() {
		if($scope.nextHistoryPageButtonClass == 'button-enabled') {
			getAdditionalGames(historyService.games.reduce(function(p, v) { return p < v.CompletionTime ? p : v.CompletionTime; }, today))
			.then(function() { changePage($scope.historyPage + 1); });
		}
	};
}]);
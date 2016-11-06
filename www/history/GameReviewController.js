var module = angular.module(GOLFPRO).config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/game-review', { templateUrl: 'history/gameReview.html', controller: 'gameReviewController' });
}]);
angular.module(GOLFPRO).controller('gameReviewController', ['$scope', '$location', 'historyService', 'courseProvider', 'gameManager', 'pageService', 'userManager', 'loginStatusProvider',
function($scope, $location, historyService, courseProvider, gameManager, pageService, userManager, loginStatusProvider) {
	var gameId = historyService.selectedGameId;
	var roundPromise = gameManager.getRound(gameId);
	var userNameMapPromise = roundPromise.then(function(round){
		return round.games.reduce(function(listPromise, user) {
			return listPromise.then(function(list) {
				return userManager.GetUserDataPromise(user.UserId).then(function(user){
					return list.concat([user]);
				});
			});
		}, Promise.resolve([]))
		.then(function(users){
			var map = {};
			users.map(function(user){
				map[user.UserId] = (user.Info || { ShortName: '?' }).ShortName;
			});
			return map;
		});
	});
	var gamesPromise = Promise.all([userNameMapPromise, roundPromise, userManager.GetUserIdPromise()])
	.then(function(result) {
		var nameMap = result[0];
		var round = result[1];
		var currentUserId = result[2];
		return round.games.map(function(game){
			var result = {
				cellStyle: game.UserId == currentUserId ? { 'background-color': '#FFEC64' } : {},
				shortName: game.UserId == currentUserId ? 'Me' : nameMap[game.UserId] || '?',
				strokes: game.Strokes,
				total: Object.keys(game.Strokes).reduce(function(total, next){ return total + game.Strokes[next]; }, 0)
			};
			return result;
		});
	});
	var coursePromise = roundPromise.then(function(round) { return courseProvider.getCourseDataPromise(round.games[0].CourseId); });
	Promise.all([gamesPromise, coursePromise])
	.then(function(result) {
		var games = result[0];
		var course = result[1];
		$scope.$apply(function() {
			$scope.games = games;
			$scope.course = course;
			$scope.courseUrl = 'res/icons/icon.png';
			var parTotal = 0;
			$scope.holes = Object.keys(course.par).map(function(hole) {
				parTotal += course.par[hole];
				return {
					holeNumber: hole,
					par: course.par[hole] || 0
				};
			});
			$scope.total = parTotal;
		});
	});
}]);
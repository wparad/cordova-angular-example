angular.module(GOLFPRO).factory('gameManager', ['apiService', 'utilities', function(apiService, utilities){
	return {
		getInProgressRound: function(gameId) {
			return apiService.getPromise('GET', '/tmpgame', {
				gameId: gameId
			})
			.then(function(data){ return data.round; })
			.catch(function(failure) {
				console.error(JSON.stringify({Error: 'Failed to get round.', Detail: failure}, null, 2));
				return Promise.reject({
					Error: 'Unable to get round, please try again later.',
					Detail: failure
				});
			});
		},
		getRound: function(gameId) {
			return apiService.getPromise('GET', '/round', {
				gameId: gameId
			})
			.then(function(data){ return data.round; })
			.catch(function(failure) {
				console.error(JSON.stringify({Error: 'Failed to get round.', Detail: failure}, null, 2));
				return Promise.reject({
					Error: 'Unable to get round, please try again later.',
					Detail: failure
				});
			});
		},
		getGameId: function() {
			return utilities.getGuid();
		},
		getGames: function(latestGameDate, gamePageSize) {
			console.log('latestGameDate: ' + latestGameDate);
			return apiService.getPromise('GET', '/game', {
				latestGameDate: latestGameDate,
				pageSize: gamePageSize
			})
			.catch(function(failure) {
				console.error(JSON.stringify({Error: 'Failed to get games.', Detail: failure}, null, 2));
				return Promise.reject({
					Error: 'Unable to get history, please try again later.',
					Detail: failure
				});
			});
		},
		saveInProgressGame: function(gameId, strokeDictionary) {
			return apiService.getPromise('PUT', '/tmpgame', {
				gameId: gameId,
				strokeDictionary: strokeDictionary,
			})
			.catch(function(failure) {
				return Promise.reject({
					Title: 'Unable to save current game, please resumbit.',
					Error: failure.stack || failure.toString(),
					Detail: failure
				});
			});
		},
		deleteInProgressGame: function(gameId) {
			return apiService.getPromise('DELETE', '/tmpgame', { gameId: gameId })
			.catch(function(failure) {
				return Promise.reject({
					Error: 'Unable to delete in progress game.',
					Detail: failure
				});
			});
		},
		saveGame: function(gameId, courseId, completionTime, strokeDictionary) {
			return apiService.getPromise('PUT', '/game', {
				gameId: gameId,
				courseId: courseId,
				strokeDictionary: strokeDictionary,
				completionTime: completionTime
			})
			.catch(function(failure) {
				console.error(JSON.stringify({Error: 'Failed to save game.', Detail: failure}, null, 2));
				return Promise.reject({
					Title: 'Unable to save current game, please resumbit.',
					Error: failure.stack || failure.toString(),
					Detail: failure
				});
			});
		}
	};
}]);
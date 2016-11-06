var gameController = 'gameController';
angular.module(GOLFPRO).factory('gameCacheService', ['storageProviderService', function(storageProviderService) {
	var storageProvider = storageProviderService.GetStorageProvider(gameController);
	var currentGame = null;
	var object = {
		SaveGame: function(game) {
			currentGame = game;
			if(!game) { storageProvider.Delete('game'); }
			else { storageProvider.Save('game', currentGame); }
		},
		GetGame: function() {
			return currentGame || storageProvider.Get('game');
		}
	};
	return object;
}]);

angular.module(GOLFPRO).config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/game/:gameId?', { templateUrl: 'game/game.html', controller: gameController });
}]);
angular.module(GOLFPRO).factory('multiplayerGameUpdateQueue', ['gameCacheService', 'gameManager', 'userManager', '$route', function(gameCacheService, gameManager, userManager, $route) {
	var updateInProgress = false;
	var updatesSent = true;
	return {
		Setup: false,
		GameUpdatePromise: function(waitTime) {
			var game = gameCacheService.GetGame();
			if(!game) { return Promise.resolve(); }
			var currentUserPromise = userManager.GetUserDataPromise();
			var roundPromise = new Promise(function(s, f) {
				setTimeout(function() {
					if(updateInProgress) { f('Update in progress.'); }
					updateInProgress = true;
					gameManager.getInProgressRound(game.gameId)
					.then(function(result){ s(result); }, function(failure){ f(failure); });
				}, 1000 * waitTime);
			});

			var competitorsPromise = roundPromise
			.then(function(round){
				return round.games.reduce(function(listPromise, user) {
					return listPromise.then(function(list) {
						return userManager.GetUserDataPromise(user.UserId).then(function(user){
							return list.concat([user]);
						});
					});
				}, Promise.resolve([]));
			});

			var gameAcceptNotificationPromise = Promise.resolve();
			if(!updatesSent) {
				gameAcceptNotificationPromise = competitorsPromise.then(function(competitors){
					var pushIdList = competitors.map(function(user){ return user.PushId; });
					return currentUserPromise.then(function(currentUser){
						pushIdList = [currentUser.UserId];
						var currentUserInfo = currentUser.Info || { ShortName: '?', Name: 'Unknown User' };
						return userManager.SendMessage(pushIdList, {
							gameId: game.gameId,
							type: 'GameAccept',
							userId: currentUser.UserId,
							shortName: currentUserInfo.ShortName,
							title: 'GolfPro New Competitor',
							body: currentUserInfo.Name + ' has joined your round'
						});
					});
				});
			}
			var userNameMapPromise = competitorsPromise
			.then(function(users){
				var map = {};
				users.map(function(user){
					map[user.UserId] = (user.Info || { ShortName: '?' }).ShortName;
				});
				return map;
			});
			var resultPromise = Promise.all([userNameMapPromise, roundPromise, currentUserPromise, gameAcceptNotificationPromise])
			.then(function(result) {
				var nameMap = result[0];
				var round = result[1];
				var currentUser = result[2];
				return round.games.map(function(user){
					var result = {
						IsCurrentUser: user.UserId === currentUser.UserId,
						UserId: user.UserId,
						ShortName: nameMap[user.UserId] || '?',
						Strokes: user.Strokes
					};
					return result;
				});
			})
			.then(function(users) {
				users.map(function(user){
					var existingUser = game.users.find(function(matchingUser) { return matchingUser.UserId === user.UserId; });
					if(existingUser) {
						existingUser.ShortName = user.ShortName;
						if(!user.IsCurrentUser) { existingUser.Strokes = user.Strokes; } //Trust the values saved locally, over remote server for the current user
						existingUser.IsCurrentUser = user.IsCurrentUser;
					}
					else {
						game.users.push(user);
					}
				});
				if($route && $route.current && $route.current.locals && $route.current.locals.$scope) {
					var scope = $route.current.locals.$scope;
					scope.$apply(function(){
						if(scope.game) {
							scope.game = game;
						}	
					});
				}
				return Promise.resolve()
				.then(function() {
					gameCacheService.SaveGame(game);
					return true;
				});
			});
			resultPromise.then(function(){ updateInProgress = false; }, function(){ updateInProgress = false; });
			return resultPromise;
		}
	};
}]);
angular.module(GOLFPRO).controller(gameController, ['$scope', '$route', '$routeParams', 'ngDialog', 'gameCacheService', 'guiManager', 'courseProvider',
	'gameManager', 'pageService', 'userManager', 'pushService', 'multiplayerGameUpdateQueue',
function($scope, $route, $routeParams, ngDialog, gameCacheService, guiManager, courseProvider, gameManager, pageService, userManager, pushService, multiplayerGameUpdateQueue) {
	if(!multiplayerGameUpdateQueue.Setup) {
		document.addEventListener("resume", function(){
			multiplayerGameUpdateQueue.GameUpdatePromise(0);
		}, false);
		multiplayerGameUpdateQueue.Setup = true;
	}
	var updateCompetitorScoreCard = function(waitTime) {
		return multiplayerGameUpdateQueue.GameUpdatePromise(waitTime);
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
	$scope.InviteButtonClick = function() {
		return new Promise(function(s, f) {
			return pushService.HasPermission() ? s(true) : f('Push is not enabled.');
		}).then(function(){
			return ngDialog.open({
				closeByNavigation: true,
				width: 320,
				template: 'userPopupTemplate.html',
				resolve: {
					friends: function() { return userManager.GetFriends(); }
				},
				controller: ['$scope', 'friends', function($scope, friends) {
					$scope.friends = friends.map(function(friend){
						return {
							id: friend.UserId,
							pushId: friend.PushId,
							name: (friend.Info || { Name: '?' }).Name,
							selected: false
						};
					});
					$scope.CloseClick = function(ok) {
						var selectedFriends = ok ? $scope.friends.filter(function(friend){ return friend.selected; }).map(function(friend){ return friend.pushId; }) : [];
						$scope.closeThisDialog(selectedFriends);
					};
					$scope.SearchForNewButtonClick = function() {
						$scope.closeThisDialog(null);
						pageService.NavigateToPage('competition');
					};
				}],
				className: 'ngdialog-theme-default'
			}).closePromise.then(function(dialogResult){
				console.log(JSON.stringify(dialogResult, null, 2));
				var isarray = Object.prototype.toString.call(dialogResult.value) === '[object Array]';
				if(!isarray || !dialogResult.value || dialogResult.value.length < 1) { return; }

				return userManager.GetUserDataPromise()
				.then(function(currentUser){
					var currentUserInfo = currentUser.Info || { ShortName: '?', Name: 'Unknown User' };
					return userManager.SendMessage(dialogResult.value, {
						gameId: $scope.game.gameId,
						type: 'GameInvite',
						userId: currentUser.UserId,
						shortName: currentUserInfo.ShortName,
						title: 'GolfPro Round Invite',
						body: 'Round competitor ' + currentUserInfo.Name
					});
				})
				.then(function(success) {
					console.log(JSON.stringify({Title: 'Invite sent', Result: success.toString(), Detail: success}, null, 2));
					return Promise.all([updateCompetitorScoreCard(10), updateCompetitorScoreCard(30), updateCompetitorScoreCard(60)])
					.catch(function(failure){
						console.error(JSON.stringify({Title: 'Failed to update competitors', Error: failure.stack || failure.toString(), Detail: failure}, null, 2));
					});
				}, function(failure){
					console.error(JSON.stringify({Title: 'Failed to send invite', Error: failure.stack || failure.toString(), Detail: failure}, null, 2));
				});
			});
		}, function(failure){
			guiManager.toast('Invitations require push notifications.', 1000, 'top');
		});
	};
	var startNewGame = function() {
		var userDataPromise = userManager.GetUserDataPromise();
		return Promise.all([courseProvider.getCoursePromise(), userDataPromise])
		.catch(function(error) {
			console.log(JSON.stringify({Title: 'Failed to get Course', Error: error.stack || error.toString(), Detail: error}, null, 2));
			switch (error.Type) {
				case 'GPS':
					guiManager.toast('Unable to determine, your current location. If your gps is not enabled, please enable it and try again.', 3000, 'top');
					pageService.GoBackPage();
					return Promise.reject('Location cannot be determined.');
				case 'NETWORK':
					guiManager.toast('Trouble connecting to peers, internet connection issue.', 2000, 'center');
					pageService.GoBackPage();
					return Promise.reject({Error: 'Network error.', Detail: error});
				case 'API':
					guiManager.toast('A new course will be created at your location, because no existing course was found.', 4000, 'top');
					return Promise.all([courseProvider.getNewCoursePromise(error.Location), userDataPromise]);
				default:
					pageService.GoBackPage();
					return Promise.reject({Error: 'Error Type Unknown.', Detail: error});
			}
		})
		.then(function(result) {
			var course = result[0];
			var currentUser = result[1];
			var strokeMap = {};
			Object.keys(course.par).map(function(hole){ strokeMap[hole] = null; });
			var game = {
				gameId: $routeParams.gameId || gameManager.getGameId(),
				course: course,
				//New Games do not contain any players
				users: [
					{
						IsCurrentUser: true,
						UserId: currentUser.UserId,
						ShortName: (currentUser.Info || { ShortName: 'ME' }) .ShortName,
						Strokes: strokeMap
					}
				]
			};
			gameCacheService.SaveGame(game);
			gameManager.saveInProgressGame(game.gameId, {});
			$scope.$apply(function() {
				$scope.game = game;
			});
		}).then(function(){
			if($routeParams.gameId) { updateCompetitorScoreCard(0); }
			$routeParams.gameId = null;
		});
	};

	var cachedGame = gameCacheService.GetGame();
	if(cachedGame && $routeParams.gameId && (cachedGame.gameId != $routeParams.gameId) && cachedGame.users && cachedGame.users.length > 0) {
		var message = 'You have accepted an invite and you currently have an in progress round. Do you want to merge the games (carry over your scores)?';
		guiManager.confirm(message, function(success) {
			if(success) {
				console.log('Merging Existing Game.');
				cachedGame.gameId = $routeParams.gameId;
				gameCacheService.SaveGame(cachedGame);
				$scope.$apply(function() { $scope.game = cachedGame; });
				userManager.GetUserDataPromise()
				.then(function(currentUser){
					gameManager.saveInProgressGame(cachedGame.gameId, $scope.game.users.find(function(user){ return user.UserId === currentUser.UserId; }).Strokes);
				});
				updateCompetitorScoreCard(0);
				$routeParams.gameId = null;
			}
			else { startNewGame(); }
		}, 'Locating Course');
	}
	else if(cachedGame && (!$routeParams.gameId || (cachedGame.gameId === $routeParams.gameId)) && cachedGame.users && cachedGame.users.length > 0) {
		console.log('Continuing Existing Game.');
		$scope.game = cachedGame;
		updateCompetitorScoreCard(0);
		$routeParams.gameId = null;
	}
	else {
		startNewGame();
	}

	$scope.startNewRoundButtonClick = function() {
		guiManager.confirm('Discard existing game and start new round?', function(success) {
			if(success) {
				gameManager.deleteInProgressGame($scope.game.gameId);
				startNewGame();
			}
		}, 'Start Over');
	};
	$scope.submitButtonEnabled = true;
	$scope.submitButtonClick = function() {
		if(!$scope.submitButtonEnabled) { return; }
		$scope.submitButtonEnabled = false;

		userManager.GetUserDataPromise()
		.then(function(currentUser){
			var strokeDictionary = $scope.game.users.find(function(user){ return user.UserId === currentUser.UserId; }).Strokes;
			var invalidHoles = {};
			var is9holeGame = Object.keys($scope.game.course.par).every(function(hole) {
				/* jshint -W041 */ //What other values could hole have that we don't want to check for?
				var isValue = strokeDictionary[hole] && strokeDictionary[hole] != "";
				/* jshint +W041 */
				return hole <= 9 ? isValue : !isValue;
			});
			Object.keys($scope.game.course.par).map(function(hole) {
				var value = strokeDictionary[hole];
				if(is9holeGame) {
					if(hole <= 9 && (!value || isNaN(value) || Number(value) < 1 || Number(value > 100))) {
						invalidHoles[hole] = true;
					}
				}
				else if (!value || isNaN(value) || Number(value) < 1 || Number(value > 100)) {
					invalidHoles[hole] = true;
				}
			});

			if(Object.keys(invalidHoles).length > 0) {
				$scope.submitButtonEnabled = true;
				guiManager.alert('Cannot complete the game because the following holes have an invalid score: ' + Object.keys(invalidHoles).join(', '), function() {}, 'Strokes', 'OK');
			}
			else {
				return gameManager.saveGame($scope.game.gameId, $scope.game.course.id, new Date().getTime(), strokeDictionary)
				.then(function(saveResult) {
					$scope.submitButtonEnabled = true;
					console.log(JSON.stringify(saveResult, null, 2));
					gameCacheService.SaveGame(null);
					guiManager.toast('Round Complete', 1000, 'bottom');
					pageService.NavigateWithoutStack('history');
					return saveResult;
				}, function(error) {
					$scope.submitButtonEnabled = true;
					var getOriginalError = function(info) {
						if(!info) { return null; }
						if(info.originalError) { return getOriginalError(info.originalError); }
						return info.code;
					};
					var originalError = getOriginalError(error.Detail);
					if(originalError === 'NetworkingError') {
						guiManager.toast('Game was not saved due to internet connection issues.', 2000, 'center');
					}
					else {
						guiManager.toast('Game was not saved.', 2000, 'center');
					}
					console.log(JSON.stringify({Title: 'Failed to save game', Error: error.stack || error.toString(), Detail: error}, null, 2));
					return Promise.reject('Game was not saved.');
				})
				.then(function(success) {
					if($scope.game.course.newCourseLocation) {
						return Promise.resolve()
						.catch(function(noResult){ return null; })
						.then(function(suggestedName) {
							return courseProvider.MakeRequest($scope.game.gameId, $scope.game.course.newCourseLocation, $scope.game.course.par, suggestedName || 'NoName');
						});
					}
				});
			}
		});
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
	$scope.RefreshButtonClick = function() {
		multiplayerGameUpdateQueue.GameUpdatePromise(0);
	};
	$scope.GoToFirstHoleClick = function() {
		pageService.NavigateToPage('hole/1');
	};
	$scope.SwipeLeft = function() {
		pageService.NavigateToPage('hole/1');
	};
	$scope.SwipeRight = function() {
		pageService.NavigateToPage('hole/last');
	};
}]);
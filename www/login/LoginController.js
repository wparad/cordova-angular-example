angular.module(GOLFPRO).config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/', { templateUrl: 'login/login.html', controller: 'loginController' });
}]);
angular.module(GOLFPRO).controller('loginController', [
	'$scope', 'loginStatusProvider', 'guiManager', 'eventHandler', 'pageService', 'userManager',
function($scope, loginStatusProvider, guiManager, eventHandler, pageService, userManager) {
	$scope.LoginButtonsVisible = false;
	loginStatusProvider.validateAuthenticationPromise().then(
		function() { pageService.NavigateOrigin('home'); },
		function() { $scope.LoginButtonsVisible = true; }
	).then(function() {
		setTimeout(function() { navigator.splashscreen.hide(); }, 100);
	});

	$scope.eulaUrl = device.platform.match(/iOS/i) ? 'http://www.apple.com/legal/internet-services/itunes/appstore/dev/stdeula/' : 'https://github.com/FutureSport-Technologies/Golf-Pro/blob/master/EULA.md';
	$scope.SignInWithUserNameButtonClick = function() {
		$scope.LoginButtonsVisible = false;
		pageService.NavigateToPage('signup');
	};
	$scope.ConnectWithFacebookButtonClick = function() {
		$scope.LoginButtonsVisible = false;
		loginStatusProvider.attemptFacebookLoginPromise()
		.then(function(authorization) {
			console.log(JSON.stringify({Title: 'User Login Success', Result: authorization}, null, 2));
			return userManager.GetUserExistsPromise()
			.then(function(user) {
				if(user) {
					pageService.NavigateToPage('home');
					return user;
				}
				var updateUserPromise = new Promise(function(s, f) { return facebookConnectPlugin.api('/me?fields=first_name,email', null, s, f); })
				.then(function(result) {
					return userManager.UpdateUserPromise({
						info: {
							Name: result.first_name,
							ShortName: result.first_name.slice(0, 4),
							Email: result.email
						}
					});
				});
				updateUserPromise.then(function(){ pageService.NavigateToPage('profile'); });
				return updateUserPromise;
			})
			.then(function(){ eventHandler.log('Login', {Result: 'Success'}); });
		}, function(error) {
			$scope.$apply(function(){ $scope.LoginButtonsVisible = true; });
			switch ((error.Detail || {}).code) {
				case 'NetworkingError':
					guiManager.toast('Trouble connecting to peers, internet connection issue.', 2000, 'center');
					break;
				default:
					guiManager.toast('Failed to login using Facebook.', 1000, 'center');
			}
			console.error(JSON.stringify({ Title: 'Failed to connect using Facebook.', Error: error.stack || error.toString(), Detail: error }, null, 2));
			eventHandler.capture('LoginFailure', {Title: 'Failure to Login using Facebook', Error: error.stack || error.toString(), Detail: error});
		}).catch(function(error) {
			$scope.$apply(function(){ $scope.LoginButtonsVisible = true; });
			guiManager.toast('Trouble connecting with peers, please try again.', 1000, 'center');
			console.error(JSON.stringify({ Title: 'Failed to connect using Facebook.', Error: error.stack || error.toString(), Detail: error }, null, 2));
			eventHandler.capture('LoginFailure', {Title: 'Failure to Login using Facebook', Error: error.stack || error.toString(), Detail: error});
		});
	};
	$scope.ConnectWithGoogleButtonClick = function() {
		$scope.LoginButtonsVisible = false;
		loginStatusProvider.attemptGoogleLoginPromise()
		.then(function(authorization) {
			console.log(JSON.stringify({Title: 'User Login Success', Result: authorization}, null, 2));
			return userManager.GetUserExistsPromise()
			.then(function(user) {
				if(user) {
					pageService.NavigateToPage('home');
					return user;
				}

				var updateUserPromise = userManager.UpdateUserPromise({
					info: {
						Name: authorization.givenName,
						ShortName: authorization.givenName.slice(0, 4),
						Email: authorization.email
					}
				});
				updateUserPromise.then(function(){ pageService.NavigateToPage('profile'); });
				return updateUserPromise;
			})
			.then(function(){ eventHandler.log('Login', {User: authorization.email, Result: 'Success'}); });
		}, function(error) {
			$scope.$apply(function(){ $scope.LoginButtonsVisible = true; });
			console.error(JSON.stringify({ Title: 'Failed to connect using Google.', Error: error }, null, 2));
			switch ((error.Detail || {}).code) {
				case 'NetworkingError':
					guiManager.toast('Trouble connecting to peers, internet connection issue.', 2000, 'center');
					break;
				default:
					guiManager.toast('Failed to login using Google.', 1000, 'center');
			}
			eventHandler.capture('LoginFailure', {Title: 'Failure to Login using Google', Error: error.stack || error.toString(), Detail: error});
		}).catch(function(error) {
			$scope.$apply(function(){ $scope.LoginButtonsVisible = true; });
			console.error(JSON.stringify({ Title: 'Failed to connect using Google.', Error: error.stack || error.toString(), Detail: error }, null, 2));
			guiManager.toast('Trouble connecting with peers, please try again.', 1000, 'center');
			eventHandler.capture('LoginFailure', {Title: 'Failure to Login using Google', Error: error.stack || error.toString(), Detail: error});
		});
	};
}]);
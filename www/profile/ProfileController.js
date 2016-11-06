angular.module(GOLFPRO).config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/profile/:userId?', { templateUrl: 'profile/profile.html', controller: 'profileController' });
}]);
angular.module(GOLFPRO).controller('profileController', ['$scope', '$routeParams', 'userManager', 'guiManager', 'pageService',
function($scope, $routeParams, userManager, guiManager, pageService) {
	var readonlyStyle = { 'resize' : 'none', 'margin-bottom' : '10px', 'border-color' : '#FFFFFF' };
	var editableStyle = { 'resize' : 'none', 'margin-bottom' : '10px' };
	$scope.AllowEdit = !$routeParams.userId;
	$scope.InEditMode = false;
	$scope.TextAreaStyle = readonlyStyle;
	var picturePromise = Promise.resolve({});
	$scope.FollowButtonClick = function() {

	};
	$scope.PictureClick = function() {
		if(!$scope.InEditMode) { return; }
		new Promise(function(s, f) { window.imagePicker.getPictures(s, f, { maximumImagesCount: 1, width: 300, height: 300 }); })
		.then(function(results) {
			picturePromise = new Promise(function(s, f) {
				if(!results || results.length < 1 || !results[0]) { return f('No picture loaded.'); }
				var imageUri = results[0];
				$scope.$apply(function() {
					$scope.picture = imageUri;
					$scope.user.ImageDataUpdate = true;
				});

				function base64toBlob(base64Data, contentType) {
					contentType = contentType || '';
					var sliceSize = 1024;
					var byteCharacters = atob(base64Data);
					var bytesLength = byteCharacters.length;
					var slicesCount = Math.ceil(bytesLength / sliceSize);
					var byteArrays = new Array(slicesCount);

					for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
						var begin = sliceIndex * sliceSize;
						var end = Math.min(begin + sliceSize, bytesLength);

						var bytes = new Array(end - begin);
						for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
							bytes[i] = byteCharacters[offset].charCodeAt(0);
						}
						byteArrays[sliceIndex] = new Uint8Array(bytes);
					}
					return new Blob(byteArrays, { type: contentType });
				}
				// readFromFile(imageUri).then(function(suc) { s(suc); }, function(fail){ f(fail); });
				var canvas = document.createElement('canvas');
				var ctx = canvas.getContext("2d");
				var img = new Image();
				img.onload = function(){
					canvas.width = this.width;
					canvas.height = this.height;
					ctx.drawImage(img, 0, 0);
					try {
						s(base64toBlob(canvas.toDataURL('image/jpeg', 1.0).split(',')[1]), 'image/jpeg');
					}
					catch (exception) {
						f(exception.stack || exception);
					}
				};
				try {
					img.src = imageUri;
				}
				catch (exception) {
					f(exception.stack || exception);
				}
			});
			return picturePromise;
		}, function(error) {
			console.error('Error: ' + error.stack || error.toString());
		});
	};
	$scope.EditButtonClick = function() {
		if($scope.InEditMode && !$scope.SavingInProgress) {
			if($scope.user.Info.Name.length === 0) {
				guiManager.toast('Please fill out your display name.', 1000, 'center');
				return;
			}
			if($scope.user.Info.ShortName.length === 0) {
				guiManager.toast('Please fill out your short name.', 1000, 'center');
				return;
			}
			$scope.SavingInProgress = true;
			//Attepmt to save information
			var user = { info: $scope.user.Info, profile: $scope.user.Profile };
			if($scope.user.ImageDataUpdate) {
				user.image = true;
			}
			var updateUserPromise = userManager.UpdateUserPromise(user)
			.then(function(result){
				$scope.$apply(function(){
					$scope.InEditMode = false;
					$scope.SavingInProgress = false;
					$scope.TextAreaStyle = readonlyStyle;
				});
				console.log(JSON.stringify({Title: 'Profile Saved', Result: result.toString(), Detail: result}, null, 2));
			}, function(failure){
				$scope.$apply(function(){
					$scope.SavingInProgress = false;
				});
				console.error(JSON.stringify({Title: 'Failed to save profile', Error: failure.stack || failure.toString(), Detail: failure}, null, 2));
				guiManager.toast('Failed to save profile.', 1000, 'center');
				return Promise.reject();
			});
			if($scope.user.ImageDataUpdate) {
				updateUserPromise.then(function(){
					//upload image to S3
					return picturePromise.then(function(data){
						return new Promise(function(s, f) {
							new AWS.S3().upload({
								Bucket: 'users.futuresporttechnologies.com',
								Key: $scope.user.UserId + '/profile.resize.jpg',
								ContentEncoding: 'base64',
								ContentType: 'image/jpeg',
								Body: data
							}, function(error, data) { error ? f(error.stack || error.toString()) : s(data); });
						});
					}).then(function(success){ console.log('upload success'); }, function(error) {
						console.error(JSON.stringify({Title: 'Failed to upload new image', Error: error.stack || error.toString(), Detail: error}, null, 2));
					});
				});
			}
		}
		else {
			$scope.InEditMode = true;
			$scope.TextAreaStyle = editableStyle;
			$scope.SavingInProgress = false;
		}
	};
	userManager.GetUserDataPromise($routeParams.userId)
	.then(function(user) {
		console.log('PROFILE RESULT: ' + JSON.stringify(user, null, 2));
		$scope.$apply(function() {
			$scope.user = user;
			if(!$scope.user.Profile) { $scope.user.Profile = {}; }
			$scope.picture = user.Profile && user.Profile.Url ? user.Profile.Url : 'res/icons/icon.png';
		});
	})
	.catch(function(failure) {
		console.log(JSON.stringify({Error: 'Failed to get user.', Detail: failure}, null, 2));
		guiManager.toast('Failed to retrieve user profile.', 1000, 'center');
	});

	$scope.historyButtonClick = function() {
		pageService.NavigateToPage('history');
	};
}]);

angular.module(GOLFPRO).factory('courseProvider', ['apiService', function(apiService) {
	var lastKnownLocation = null;
	var courseDictionary = {};
	var getCourseDataPromise = function(id) {
		if(!courseDictionary[id]) {
			return apiService.getPromise('GET', '/course', {id: id})
			.then(function(course) {
				courseDictionary[id] = course;
				return course;
			});
		}
		else {
			return Promise.resolve(courseDictionary[id]);
		}
	};
	var MakeRequest = function(gameId, newCourseLocation, suggestedPars, suggestedName) {
		return apiService.getPromise('POST', '/courseRequest', {
			gameId: gameId,
			location: newCourseLocation,
			par: suggestedPars,
			name: suggestedName
		});
	};
	return {
		MakeRequest: MakeRequest,
		getCourseDataPromise: getCourseDataPromise,
		getNewCoursePromise: function(location) {
			return getCourseDataPromise(0).then(function(course){
				course.newCourseLocation = location;
				return course;
			});
		},
		getCoursePromise: function() {
			return new Promise(function(s, f) {
				var onSuccess = function(obj) {
					console.log(JSON.stringify({Title: '===> End (Success)', Now: new Date().toISOString()}, null, 2));
					var geo = {
						coords: {
							latitude: obj.coords.latitude,
							longitude: obj.coords.longitude,
							altitude: obj.coords.altitude,
							accuracy: obj.coords.accuracy,
							altitudeAccuracy: obj.coords.altitudeAccuracy,
							heading: obj.coords.heading,
							speed: obj.coords.speed
						},
						timestamp: obj.timestamp
					};
					return s(geo);
				};

				var onError = function(obj) {
					console.log(JSON.stringify({Title: '===> End (Failure)', Now: new Date().toISOString()}, null, 2));
					var error = {
						code: obj.code,
						message: obj.message
					};
					return f(error);
				};

				console.log(JSON.stringify({Title: 'GeoLocation Start', Now: new Date().toISOString()}, null, 2));
				navigator.geolocation.getCurrentPosition(onSuccess, onError, { maximumAge: 10000, timeout: 3000 /*, enableHighAccuracy: true */ });
			})
			.then(function(location) {
				lastKnownLocation = {
					latitude: location.coords.latitude,
					longitude: location.coords.longitude,
					accuracy: location.coords.accuracy
				};
				//Find course
				return apiService.getPromise('GET', '/course', {
					location: lastKnownLocation
				});
			}, function(failure) {
				return Promise.reject({
					Type: 'GPS',
					Error: 'No course found because your current location could not be determined.',
					Detail: failure
				});
			})
			.catch(function(failure) {
				if(failure.code == 'NetworkingError') {
					return Promise.reject({
						Type: 'NETWORK',
						Error: 'No course found because there is no internet connection.',
						Detail: failure
					});
				}
				return Promise.reject({
					Type: 'API',
					Error: 'Failed to get course from service.',
					Detail: failure,
					Location: lastKnownLocation
				});
			});
		}
	};
}]);
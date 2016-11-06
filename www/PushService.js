angular.module(GOLFPRO).provider('pushService', [ 'apiServiceProvider', 'pageServiceProvider', 'guiManagerProvider', 'loginStatusProviderProvider',
function(apiServiceProvider, pageServiceProvider, guiManagerProvider, loginStatusProviderProvider){
	if(window.cordova && window.cordova.platformId === 'browser') {
		this.$get = function() {
			return {
				Configure: function(){},
				Setup: function(){},
				HasPermission: function(){ return true; }
			};
		};
		return;
	}
	var push = PushNotification.init({
		android: {
			senderID: FCM_SENDER_ID,
			iconColor: '#000000'
		},
		browser: {
			pushServiceURL: 'http://push.api.phonegap.com/v1/push'
		},
		ios: {
			senderID: FCM_SENDER_ID,
			alert: 'true',
			badge: 'true',
			sound: 'true',
			clearBadge: 'true'
		},
		windows: {}
	});

	var pushId = null;
	push.on('registration', function(data) {
		pushId = data.registrationId;
	});
	push.on('error', function(e) {
		console.error('PUSH ERROR: ' + e.message);
	});
	var service = {
		Configure: function() {
			if(!pushId) { return Promise.resolve(null); }

			return apiServiceProvider.$get().getPromise('POST', '/push', {
				token: pushId,
				platform: device.platform
			}).catch(function(failure){
				console.error(JSON.stringify({Title: 'Failed to set up Push notification', Error: failure.stack || failure.toString(), Detail: failure}, null, 2));
				Promise.resolve(null);
			});
			// push.setApplicationIconBadgeNumber(function() {
			// 	console.log('success');
			// }, function() {
			// 	console.log('error');
			// }, 2);

			// push.clearAllNotifications(function() {
			// 	console.log('success');
			// }, function() {
			// 	console.log('error');
			// });

		},
		Setup: function() {
			push.on('notification', function(data) {
				console.log('PUSH: ' + JSON.stringify(data, null, 2));
				switch (data.additionalData.type) {
					case 'GameInvite':
						guiManagerProvider.$get()
							.confirmPromise('You have a game invite from ' + data.additionalData.shortName + '. Do you want to join the new game?', 'Game Invite')
						.then(function(){ return loginStatusProviderProvider.$get().validateAuthenticationPromise(); })
						.then(function() { return pageServiceProvider.$get().NavigateWithRemoveStack('game/' + data.additionalData.gameId); });
						break;
					case 'GameAccept':
						guiManagerProvider.$get().toast(data.additionalData.shortName + 'has joined your game.', 1000, 'center');
						break;
					default:
						console.log(JSON.stringify({Title:'Notification Found', Info: data.toString(), Detail: data}, null, 2));
				}
			});
		},
		HasPermission: function() {
			return pushId !== null;
		}
	};
	this.$get = function() { return service; };
}]);
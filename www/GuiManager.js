angular.module(GOLFPRO).provider('guiManager', function() {
	var isMobile = window.cordova && window.cordova.platformId !== 'browser';
	var service = {
		alert: function(a, b, c, d) { navigator.notification && navigator.notification.alert ? navigator.notification.alert(a, b, c, d) : window.alert(a); },
		confirm: function(a, b, c) {
			return new Promise(function(s, f) {
				if(isMobile && navigator.notification && navigator.notification.alert) {
					return navigator.notification.confirm(a, function(i) { i == 1 ? s() : f(); }, c, ['OK', 'Cancel']);
				}
				else { return window.confirm(a) ? s() : f(); }
			})
			.then(function() { return b(true); })
			.catch(function() { return b(false); });
		},
		confirmPromise: function(a, c) {
			return new Promise(function(s, f) {
				if(isMobile && navigator.notification && navigator.notification.confirm) {
					return navigator.notification.confirm(a, function(i) { i == 1 ? s() : f(); }, c, ['OK', 'Cancel']);
				}
				else { return window.confirm(a) ? s() : f(); }
			});
		},
		promptPromise: function(question, title, buttons, defaultAnswer) {
			return new Promise(function(s, f) {
				if(isMobile && navigator.notification && navigator.notification.prompt) {
					return navigator.notification.prompt(question, function(result) { results.buttonIndex == 1 ? s(results.input1) : f(); }, title, buttons || ['OK'], defaultAnswer);
				}
				else {
					var result = window.prompt(question, defaultAnswer);
					return result ? s(result) : f();
				}
			});
		},
		toast: function(message, duration, position) {
			var data = {'toast': 'toastData'};
			return new Promise(function(s, f) {
				if(window.cordova.platformId != 'browser') {
					return window.plugins.toast.showWithOptions({
						message: message,
						duration: duration,
						position: position,
						data: data //,
						// styling: {
						// 	opacity: 0.75, // 0.0 (transparent) to 1.0 (opaque). Default 0.8
						// 	backgroundColor: '#FF0000', // make sure you use #RRGGBB. Default #333333
						// 	textColor: '#FFFF00', // Ditto. Default #FFFFFF
						// 	textSize: 20.5, // Default is approx. 13.
						// 	cornerRadius: 16, // minimum is 0 (square). iOS default 20, Android default 100
						// 	horizontalPadding: 20, // iOS default 16, Android default 50
						// 	verticalPadding: 16 // iOS default 12, Android default 30
						// }
					}, s, f);
					/*
					if (result && result.event) {
						console.log("The toast was tapped or got hidden, see the value of result.event");
						console.log("Event: " + result.event); // "touch" when the toast was touched by the user or "hide" when the toast geot hidden
						console.log("Message: " + result.message); // will be equal to the message you passed in
						console.log("data.foo: " + result.data.foo); // .. retrieve passed in data here

						if (result.event === 'hide') {
						  console.log("The toast has been shown");
						}
					}
					*/
				}
				else {
					alert(message);
					s(data);
				}
			});
		}
	};
	this.$get = function() { return service; };
});
angular.module(GOLFPRO).provider('pageService', [function(){
	var currentPage = '/';
	var stack = [];
	var service = {
		GetCurrentPage: function() { return currentPage; },
		AllowNavigateBackPage : function(path) {
			return currentPage != '/' && currentPage != '/home' && currentPage === path;
		},
		/* jshint -W093 */
		SetCurrentPage: function(newPage) { return currentPage = newPage; },
		/* jshint +W093 */
		NavigateOrigin: function(newPage) {
			if(currentPage == '/') {
				console.log('Navigating to Origin page: ' + currentPage + ' => ' + newPage);
				window.location.hash = newPage;
			}
		},
		NavigateWithoutStack: function(newPage) {
			console.log('Navigating to page: ' + currentPage + ' => ' + newPage);
			if(AdMob) { AdMob.hideBanner(); }
			window.location.hash = newPage;
		},
		NavigateWithRemoveStack: function(newPage) {
			console.log('Navigating to page: ' + currentPage + ' => ' + newPage);
			if(AdMob) { AdMob.hideBanner(); }
			stack = ['home'];
			window.location.hash = newPage;
		},
		NavigateToPage: function(newPage) {
			console.log('Navigating to page: ' + currentPage + ' => ' + newPage);
			if(AdMob) { AdMob.hideBanner(); }
			stack.push(currentPage);
			window.location.hash = newPage;
		},
		GoBackPage: function() {
			if(AdMob) { AdMob.hideBanner(); }
			if(!currentPage) {
				console.log('The currently open page was not set');
				window.location.hash = 'home';
				return;
			}

			var openPage = currentPage.split('/')[1];
			console.log('BackButton from page: ' + openPage);
			switch(openPage) {
				case '': //login
				case 'logout':
				case 'home':
					navigator.splashscreen.hide();
					navigator.app.exitApp();
					return;
				default:
					break;
			}

			var previousPage = stack.pop() || 'home';
			console.log('Navigating to page: ' + currentPage + ' => ' + previousPage);
			window.location.hash = previousPage;
		},
		OpenUrl: function(url) {
			stack = ['home'];
			if(AdMob) { AdMob.hideBanner(); }
			setTimeout(function() {
				console.log('FOUND DEEP LINK: ' + url);
				var match = url.match(/^.*authorize-login\?code=(.*)$/);
				if(match) { window.location.hash = 'signup/' + match[1]; }
			}, 0);
		},
	};
	this.$get = function() { return service; };
}]);
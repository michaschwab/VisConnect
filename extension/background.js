// listen for our browerAction to be clicked
chrome.browserAction.onClicked.addListener(function (tab) {
	chrome.tabs.update(tab.id, {url: tab.url, active: true}, function(tab1) {

		// add listener so callback executes only if page loaded. otherwise calls instantly
		const listener = function(tabId, changeInfo, tab) {
			if (tabId === tab1.id && changeInfo.status === 'complete') {
				// remove listener, so only run once
				chrome.tabs.onUpdated.removeListener(listener);
				// do stuff
				chrome.tabs.executeScript(tab.id, {
					file: 'inject.js'
				});
			}
		};
		chrome.tabs.onUpdated.addListener(listener);
	});
});
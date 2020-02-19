chrome.browserAction.onClicked.addListener(function (tab) {
	const newUrl = tab.url + '?visconnect';
	chrome.tabs.update(tab.id, {url: newUrl, active: true});
});
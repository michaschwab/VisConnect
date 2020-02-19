(function() {
	const inject = () => {
		// Code from https://unpkg.com/peerjs@1.0.4/dist/peerjs.min.js
		// and from https://michaschwab.github.io/DESCVis/descvis-bundle-no-ui.js
		const sources = ['peerjs.1.0.4.min.js', 'descvis-bundle.js'];

		for(const source of sources) {
			const script = document.createElement('script');
			script.src = chrome.extension.getURL(source);
			(document.head||document.documentElement).prepend(script);
		}
	};

	inject();
})();

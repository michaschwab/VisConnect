(function() {
	const inject = () => {
		// Code from https://unpkg.com/peerjs@1.0.4/dist/peerjs.min.js
		// and from https://michaschwab.github.io/VisConnect/visconnect-bundle.js
		const sources = ['peerjs.1.0.4.min.js', 'visconnect-bundle.js'];

		for(const source of sources) {
			const url = chrome.runtime.getURL(source);

			const request = new XMLHttpRequest();
			request.open('GET', url, false); // Synchronous
			request.send(null);

			if (request.status === 200) {
				const script = document.createElement('script');
				script.textContent = request.responseText;
				(document.head||document.documentElement).prepend(script);
			}
		}
	};

	inject();
})();

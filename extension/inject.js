(function() {
	const inject = () => {
		const sources = ['https://unpkg.com/peerjs@1.0.4/dist/peerjs.min.js',
			'https://michaschwab.github.io/DESCVis/descvis-bundle-no-ui.js'];
		for(const source of sources) {
			const script = document.createElement('script');
			script.src = source;
			document.head.appendChild(script);
		}
	};

	const checkIfReady = () => {
		if(document.head) {
			inject();
		} else {
			setTimeout(checkIfReady);
		}
	};
	checkIfReady();
})();
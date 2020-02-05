(function() {
	const sources = ['https://unpkg.com/peerjs@1.0.4/dist/peerjs.min.js',
		'https://michaschwab.github.io/DESCVis/descvis-bundle.js'];

	for(const source of sources) {
		const script = document.createElement('script');
		script.src = source;
		document.body.appendChild(script);
	}
})();
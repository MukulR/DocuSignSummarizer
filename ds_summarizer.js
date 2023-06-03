chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    let url = tabs[0].url;
    if(url.endsWith('.pdf')){
		console.log('Found PDF file');
		document.querySelector('#content-display').innerHTML = "Found PDF document; loading summary...";
		// If it fails here, it wasn't able to make a web requrest for some reason.
		// 1) Parse the text out of the PDF document
	}
});

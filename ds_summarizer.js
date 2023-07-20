pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';


chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
	let activeTab = tabs[0]
	let url = activeTab.url;
	if (url.endsWith('.pdf')) {
		console.log('Found PDF file');
		document.querySelector('#content-display').innerHTML = "Found PDF document; loading summary...";
		// If it fails here, it wasn't able to make a web requrest for some reason.
		// 1) Parse the text out of the PDF document

		extractText(url).then(
			async function (text) {
				var summary = await GPTRequest(text)
				summary = summary.split('-').join('<br>-');

				document.querySelector('#content-display').innerHTML = summary
			},
			function (reason) {
				alert(reason);
			},
		);

	}
});

// Make a POST request to the OpenAI API
async function GPTRequest(message) {
	const apiKey = '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'; // Replace with your API key
	const endpoint = 'https://api.openai.com/v1/chat/completions';

	const headers = {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${apiKey}`
	};

	const body = {
		'model': 'gpt-3.5-turbo',
		'messages': [
			{
				'role': 'system',
				'content': "Summarize this text into bullet points (represent using a hyphen '-') which include all essential details without using legal jargon or excessively complicated vocabulary. Ensure your summarization does NOT take away details from the content." 
			},
			{
				'role': 'user',
				'content': message
			}
		]
	};

	try {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers,
			body: JSON.stringify(body)
		});

		const data = await response.json();
		const reply = data.choices[0].message.content;

		return reply;
	} catch (error) {
		// alert(error)
		console.error('Error:', error);
		return 'An error occurred while communicating with the API.';
	}
}

function extractText(pdfUrl) {
	var pdf = pdfjsLib.getDocument(pdfUrl);

	return pdf.promise.then(function (pdf) {
		var totalPageCount = pdf.numPages;
		var countPromises = [];
		for (
			var currentPage = 1;
			currentPage <= totalPageCount;
			currentPage++
		) {
			var page = pdf.getPage(currentPage);
			countPromises.push(
				page.then(function (page) {
					var textContent = page.getTextContent();
					return textContent.then(function (text) {
						return text.items
							.map(function (s) {
								return s.str;
							})
							.join('');
					});
				}),
			);
		}

		return Promise.all(countPromises).then(function (texts) {
			return texts.join('');
		});
	});
}

document.querySelector('#button-refresh').onmousedown = function () {
	location.reload();
};

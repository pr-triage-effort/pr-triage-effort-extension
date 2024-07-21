'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

/*

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GREETINGS') {
    const message = `Hi ${sender.tab ? 'Con' : 'Pop'
      }, my name is Bac. I am from Background. It's great to hear from you.`;

    // Log message coming from the `request` parameter
    console.log(request.payload.message);
    // Send a response message
    sendResponse({
      message,
    });
  }
});

*/

async function fetchGithubAPI(req, token = null, repoURL = null) {
  const repoParam = repoURL ? new URL(repoURL).pathname : null;
  const repo = (repoParam || window.location.pathname).split('/').slice(1, 3).join('/');
  console.log(repo);

  const url = `https://api.github.com/repos/${repo}/${req}`;

  const Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        ...(token ? { Authorization } : {})
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Failed to fetch pull requests:', error);
  }
};

export { fetchGithubAPI };

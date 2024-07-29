'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

async function fetchGithubAPI(req, token = null, repoURL = null) {
  const repoParam = repoURL ? new URL(repoURL).pathname : null;
  const repo = (((repoParam && req.includes('actions')) ? repoParam : window.location.pathname)).split('/').slice(1, 3).join('/');
  //console.log(repo);

  const url = req.includes('zip') ? req : `https://api.github.com/repos/${repo}/${req}`;

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

    const data = req.includes('zip') ? response : response.json();
    //console.log(data);
    return data;
  } catch (error) {
    console.error('Failed to fetch pull requests:', error);
  }
};

export { fetchGithubAPI };

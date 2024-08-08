'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

async function fetchGithubAPI(req, token = null, repoURL = null) {
  const repoParam = repoURL ? new URL(repoURL).pathname : null;
  const repo = (((repoParam && req.includes('actions')) ? repoParam : window.location.pathname)).split('/').slice(1, 3).join('/');

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
    return data;
  } catch (error) {
    console.error('Failed to fetch pull requests:', error);
  }
};
async function getLinkedIssueWithGraphQL(pullRequestNumber, token, repoURL = null) {
  const repoParam = repoURL ? new URL(repoURL).pathname : null;

  const [repositoryOwner, repositoryName] = (((repoParam && req.includes('actions')) ? repoParam : window.location.pathname)).split('/').slice(1, 3);

  const query = `
    query {
      repository(owner: "${repositoryOwner}", name: "${repositoryName}") {
        pullRequest(number: ${pullRequestNumber}) {
          closingIssuesReferences(first: 100) {
            nodes {
              id
            }
          }
        }
      }
    }
  `;

  const data = await fetchPullRequestDetails(query, token);
  return data;
}

async function fetchPullRequestDetails(query, token) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });


  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`);
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(`GraphQL error: ${result.errors.map(error => error.message).join(', ')}`);
  }

  return result;
}

export { fetchGithubAPI, getLinkedIssueWithGraphQL };

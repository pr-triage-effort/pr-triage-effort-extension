'use strict';

const JSZip = require("jszip");
import { fetchGithubAPI } from '../background'
import { replaceHtmlContent } from './pr-ui'

// ORDERING

async function getArtefact() {
  console.log('artefact: ');

  // const data = await fetchGithubAPI('actions/artifacts', 'TOKEN', 'https://github.com/YanickValiquette/Github-sort-pr-per-effort/');

  let file;

  // https://stuk.github.io/jszip/documentation/examples/get-binary-files-ajax.html

  await fetch('https://api.github.com/repos/pr-triage-effort/pr-triage-effort-action/actions/artifacts/1703300908/zip', {
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': 'Bearer TOKEN'
    }
  }).then(function (response) {
    if (response.status === 200 || response.status === 0) {
      return Promise.resolve(response.blob());
    } else {
      return Promise.reject(new Error(response.statusText));
    }
  })
    .then(JSZip.loadAsync)
    .then(function (zip) {
      return zip.file("results.json").async("string");
    })
    .then(function success(text) {
      console.log('success');
      file = text;
    }, function error(e) {
      console.log('error');
      file = e;
    });

  const result = JSON.parse(file);

  console.log('zip url: ');
  console.log(result);
  // console.log(data.artifacts[0].archive_download_url);
}

const orderList = [];

async function sortLowest() {
  console.log('sortLowest: ');

  const data = await fetchGithubAPI('pulls?per_page=25&page=1', 'TOKEN');

  const sortedPullRequests = sortPullRequests(data, orderList).slice(0, 25);
  console.log(sortedPullRequests)
  // Format and replace the HTML content
  replaceHtmlContent(sortedPullRequests);
}

function sortPullRequests(pullRequests, orderList) {
  const pullRequestMap = {};

  // Create a map of pull requests by their IDs
  pullRequests.forEach(pr => {
    pullRequestMap[pr.number] = pr;
  });

  // Sort pull requests based on the orderList
  return orderList.map(number => pullRequestMap[number]).filter(pr => pr !== undefined);
}

export { sortLowest, getArtefact };

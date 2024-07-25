'use strict';

const JSZip = require("jszip");
import { fetchGithubAPI } from '../background'
import { replaceHtmlContent } from './pr-ui'

// ORDERING

async function getOrder(token, repo) {
  console.log('artefact: ');

  const data = await fetchGithubAPI('actions/artifacts', token, repo);

  const file = await fetchGithubAPI(data.artifacts[0].archive_download_url, token)
    .then((response) => {
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
      return text;
    }, function error(e) {
      console.log('error');
      return e;
    });

  const prs = JSON.parse(file)


  console.log('zip url: ');
  console.log(prs);
  // console.log(data.artifacts[0].archive_download_url);

  return prs.sort((a, b) => a.effort - b.effort).map((pr) => pr.number);
}

async function sort(sort, token, repo) {
  console.log('sort: ');

  const data = await fetchGithubAPI('pulls?per_page=25&page=1', token);

  const orderList = await getOrder(token, repo)

  console.log('orderList: ');
  console.log(orderList);

  const sortedPullRequests = sortPullRequests(data, orderList, sort).slice(0, 25);

  console.log('sortedPullRequests: ');
  console.log(sortedPullRequests)

  //TODO: Implement fallback when no IDs match
  // Format and replace the HTML content
  replaceHtmlContent(sortedPullRequests);
}

function sortPullRequests(pullRequests, orderList, sort) {
  const pullRequestMap = {};

  // Create a map of pull requests by their numbers
  pullRequests.forEach(pr => {
    pullRequestMap[pr.number] = pr;
  });

  console.log('pullRequestMap: ');
  console.log(pullRequestMap);

  // Sort pull requests based on the orderList
  const sortedPRs = orderList.map((effort) => pullRequestMap[effort]).filter(pr => pr !== undefined);

  return sort === 1 ? sortedPRs.toReversed() : sortedPRs;
}

export { sort };

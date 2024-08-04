'use strict';

const JSZip = require("jszip");
import { fetchGithubAPI, getLinkedIssueWithGraphQL } from '../background'
import { replaceHtmlContent } from './pr-ui'

// ORDERING

async function getOrder(token, repo) {
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

  return prs.sort((a, b) => a.effort - b.effort).map((pr) => {
    return { number: pr.number, effort: pr.effort };
  });
}

async function sort(sort, token, repo) {

  const data = await fetchGithubAPI('pulls?per_page=500', token);

  const orderList = await getOrder(token, repo)

  let sortedPullRequests = await sortPullRequests(data, orderList, sort, token, repo);
  sortedPullRequests = sortedPullRequests.slice(0, 25);

  if (sortedPullRequests.length != 0) {
    replaceHtmlContent(sortedPullRequests);
  } else {
    console.log('No pull requests matches.');
  }
}

async function fetchPRDetails(pr, token, repo) {
  if (token) {
    try {
      // Add details about the status of the PR for the check
      let result = await fetchGithubAPI(`commits/${pr.head.sha}/check-suites`, token, repo);
      if (result.total_count > 0 && result.check_suites[0].conclusion) {
        pr.status = result.check_suites[0].conclusion;
      } else {
        pr.status = "Unknown";
      }
      // Add details about the number of comments and reviews, wich cumulated gives the 
      const reviewResult = await fetchGithubAPI(`pulls/${pr.number}/reviews`, token, repo);
      result = await fetchGithubAPI(`pulls/${pr.number}`, token, repo);

      const comments = result.comments;

      pr.comments = reviewResult.filter(review => !(review.state === "APPROVED" && review.body === "")).length + Number(comments);

      // Add details about the linked issue
      result = await getLinkedIssueWithGraphQL(pr.number, token, repo);
      pr.linkedIssue = result.data.repository.pullRequest.closingIssuesReferences.nodes.length;

    } catch (error) {
      console.error(`Failed to fetch check-suites for PR ${pr.number}:`, error);
      pr.status = "Unknown";
    }
  } else {
    pr.status = "Unknown";
  }
  return pr;
}

async function sortPullRequests(pullRequests, orderList, sort, token, repo) {
  const pullRequestMap = {};

  // Create a map of pull requests by their numbers
  pullRequests.forEach(pr => {
    pullRequestMap[pr.number] = pr;
  });

  // Sort pull requests based on the orderList
  let sortedPRs = await Promise.all(orderList.map(async (order) => {
    let pr = pullRequestMap[order.number];
    if (pr) {
      try {
        pr = await fetchPRDetails(pr, token, repo);
        return { ...pr, effort: Number(order.effort.toFixed(3)) };
      } catch (error) {
        console.error(`Failed to fetch details for PR ${pr.number}:`, error);
        return undefined;
      }
    } else {
      console.warn(`No pull request found for number ${order.number}`);
      return undefined;
    }
  }));
  sortedPRs = sortedPRs.filter(pr => pr !== undefined);

  return sort === 1 ? sortedPRs.reverse() : sortedPRs;
}

export { sort };

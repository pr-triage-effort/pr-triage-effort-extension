'use strict';

const JSZip = require("jszip");
import { fetchGithubAPI, getLinkedIssueWithGraphQL } from '../background'
import { replaceHtmlContent } from './pr-ui'
import { setCustomPagination } from './custom-pagination'
import { infoStorage } from '../storage';

let sorted = false;
let data;
let orderList;
let sortedPullRequests;

let _token;
let _repo;

async function getOrder() {
  const data = await fetchGithubAPI('actions/artifacts', _token, _repo);

  const file = await fetchGithubAPI(data.artifacts[0].archive_download_url, _token)
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
      return text;
    }, function error(e) {
      return e;
    });

  const prs = JSON.parse(file)

  return prs.sort((a, b) => b.effort - a.effort).map((pr) => {
    return { number: pr.number, effort: pr.effort };
  });
}

async function sort(sort) {
  _token = await new Promise((resolve) => {
    infoStorage.get('token', (token) => {
      resolve(token);
    });
  });

  _repo = await new Promise((resolve) => {
    infoStorage.get('repo', (repo) => {
      resolve(repo);
    });
  });

  if (!sorted) {
    data = await fetchGithubAPI('pulls?per_page=500', _token);
    orderList = await getOrder();
  }

  sortedPullRequests = await sortPullRequests(data, orderList, sort);

  sortedPullRequests = sortedPullRequests.slice(0, 25);

  if (sortedPullRequests.length != 0) {
    replaceHtmlContent(sortedPullRequests);
    setCustomPagination((page) => {
      changePage(page);
    });
    sorted = true;
  } else {
    console.log('No pull requests matches.');
  }
}

async function sortPullRequests(pullRequests, orderList, sort) {
  const pullRequestMap = {};

  // Create a map of pull requests by their numbers
  pullRequests.forEach(pr => {
    pullRequestMap[pr.number] = pr;
  });

  // Sort pull requests based on the orderList
  let sortedPRs = await Promise.all(orderList.map(async (order) => {
    let pr = pullRequestMap[order.number]
    if (pr) {
      try {
        if (!sorted) {
          pr = await fetchPRDetails(pr);
        }
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

  return sort === 1 ? sortedPRs.toReversed() : sortedPRs;
}

function changePage(page) {
  if (sortedPullRequests.length === 0) {
    console.log('No cached pull requests available.');
    return;
  }

  const pageSize = 25;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedPRs = sortedPullRequests.slice(startIndex, endIndex);

  if (paginatedPRs.length !== 0) {
    replaceHtmlContent(paginatedPRs);
  } else {
    console.log('No pull requests found for this page.');
  }
}
async function fetchPRDetails(pr) {
  if (_token) {
    try {
      // Add details about the status of the PR for the check
      let result = await fetchGithubAPI(`commits/${pr.head.sha}/check-suites`, _token, _repo);
      if (result.total_count > 0 && result.check_suites[0].conclusion) {
        pr.status = result.check_suites[0].conclusion;
      } else {
        pr.status = "Unknown";
      }
      // Add details about the number of comments and reviews, wich cumulated gives the
      const reviewResult = await fetchGithubAPI(`pulls/${pr.number}/reviews`, _token, _repo);
      result = await fetchGithubAPI(`pulls/${pr.number}`, _token, _repo);

      const comments = result.comments;

      pr.comments = reviewResult.filter(review => !(review.state === "APPROVED" && review.body === "")).length + Number(comments);

      // Add details about the linked issue
      result = await getLinkedIssueWithGraphQL(pr.number, _token, _repo);
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

export { sort };

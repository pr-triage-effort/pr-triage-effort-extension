'use strict';

const JSZip = require("jszip");
import { fetchGithubAPI } from '../background.js'

// ORDERING

async function getArtefact() {
  console.log('artefact: ');

  // const data = await fetchGithubAPI('actions/artifacts', 'TOKEN', 'https://github.com/YanickValiquette/Github-sort-pr-per-effort/');

  let file;

  await fetch('https://api.github.com/repos/YanickValiquette/Github-sort-pr-per-effort/actions/artifacts/1680138073/zip', {
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



async function sortLowest() {
  console.log('sortLowest: ');

  const data = await fetchGithubAPI('pulls?per_page=25&page=1', 'TOKEN');

  // const sortedPullRequests = sortPullRequests(data, orderList).slice(0, 25);
  // console.log(sortedPullRequests)
  // Format and replace the HTML content
  // replaceHtmlContent(sortedPullRequests);
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

function replaceHtmlContent(pullRequests) {
  const xpathResult = document.evaluate("//*[contains(@aria-label, 'Issues') and contains(@role, 'group')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  const container = xpathResult.singleNodeValue;

  if (container) {
    container.innerHTML = '';

    pullRequests.forEach(pr => {
      const prHtml = generateHtmlFromJson(pr);
      container.insertAdjacentHTML('beforeend', prHtml);
    });
  } else {
    console.log("Container element not found");
  }
}

function generateHtmlFromJson(pr) {
  const issueNumber = pr.number;
  const title = pr.title;
  const createdAt = pr.created_at;
  const author = pr.user.login;
  const commentsCount = pr.comments;
  const milestone = pr.milestone;
  const assignees = pr.assignees.map(assignee => {
    return {
      username: assignee.login,
      avatar_url: assignee.avatar_url
    };
  });
  const labels = pr.labels.map(label => {
    const { r, g, b } = hexToRgb(label.color);
    const { h, s, l } = rgbToHsl(r, g, b);
    return {
      name: label.name,
      color: label.color,
      description: label.description,
      r: r,
      g: g,
      b: b,
      h: h,
      s: s,
      l: l
    };
  });

  return `
    <div id="issue_${issueNumber}" class="Box-row Box-row--focus-gray p-0 mt-0 js-navigation-item js-issue-row" data-id="${pr.id}" data-pjax="#repo-content-pjax-container" data-turbo-frame="repo-content-turbo-frame">
        <div class="d-flex Box-row--drag-hide position-relative">
            <!-- Checkbox column -->
            <label class="flex-shrink-0 py-2 pl-3 d-none d-md-block">
                <input type="checkbox" data-check-all-item="" class="js-issues-list-check" name="issues[]" value="${issueNumber}" aria-labelledby="issue_${issueNumber}_link" autocomplete="off">
            </label>
            <!-- Pull Request icon column -->
            <div class="flex-shrink-0 pt-2 pl-3">
                <span class="tooltipped tooltipped-e" aria-label="Open Pull Request">
                    <svg class="octicon octicon-git-pull-request color-fg-open" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"></path></svg>
                </span>
            </div>
            <!-- Issue title column -->
            <div class="flex-auto min-width-0 p-2 pr-3 pr-md-2">
                <!-- Title -->
                <a id="issue_${issueNumber}_link" class="Link--primary v-align-middle no-underline h4 js-navigation-open markdown-title" data-hovercard-type="pull_request" data-hovercard-url="/user/repo/pull/${issueNumber}/hovercard" href="/user/repo/pull/${issueNumber}" data-turbo-frame="repo-content-turbo-frame">${title}</a>
                <!-- BUILD STATUS WOULD GO HERE! -->
                <!-- Labels -->
                ${labels.length > 0 ? `
                <span class="lh-default d-block d-md-inline">
                    ${labels.map(label => `
                        <a id="label-${label.name}" href="/user/repo/pulls?q=is%3Apr+is%3Aopen+label%3A%22${encodeURIComponent(label.name)}%22" data-name="${label.name}" style="--label-r:${label.r};--label-g:${label.g};--label-b:${label.b};--label-h:${label.h};--label-s:${label.s};--label-l:${label.l};" data-view-component="true" class="IssueLabel hx_IssueLabel" aria-describedby="tooltip-${label.name}" data-turbo-frame="repo-content-turbo-frame">
                            ${label.name}
                        </a>
                        <tool-tip id="tooltip-${label.name}" for="label-${label.name}" popover="manual" data-direction="s" data-type="description" data-view-component="true" class="position-absolute sr-only" role="tooltip" style="--tool-tip-position-top: 515px; --tool-tip-position-left: 237.046875px;">
                            ${label.description}
                        </tool-tip>
                    `).join('')}
                </span>` : ''}
                <!-- Text under title -->
                <div class="d-flex mt-1 text-small color-fg-muted">
                <!-- Opened by -->
                    <span class="opened-by">
                        #${issueNumber} opened <relative-time datetime="${createdAt}" class="no-wrap" title="${new Date(createdAt).toLocaleString()}">${new Date(createdAt).toLocaleDateString()}</relative-time> by
                        <a class="Link--muted" title="Open pull requests created by ${author}" data-hovercard-type="user" data-hovercard-url="/users/${author}/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="/user/repo/issues?q=is%3Apr+is%3Aopen+author%3A${author}" data-turbo-frame="repo-content-turbo-frame">${author}</a>
                    </span>
                <!-- Review Status -->
                    ${commentsCount > 0 ? `
                    <span class="d-none d-md-inline-flex">
                        <span class="tooltipped tooltipped-s" aria-label="${commentsCount} comments">
                            <svg class="octicon octicon-comment v-align-middle" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M1.75 2.5a.25.25 0 0 0-.25.25v7a.25.25 0 0 0 .25.25H3v1.15a.1.1 0 0 0 .162.084L5.85 10H14.25a.25.25 0 0 0 .25-.25v-7a.25.25 0 0 0-.25-.25H1.75ZM.5 2.75C.5 1.784 1.284 1 2.25 1h11.5c.966 0 1.75.784 1.75 1.75v7c0 .966-.784 1.75-1.75 1.75H6.175l-3.516 2.635A1.1 1.1 0 0 1 1 10.65V9.5h-1A1.75 1.75 0 0 1 .5 2.75Z"></path></svg>
                            ${commentsCount}
                        </span>
                    </span>` : ''}
                 <!-- Milestone -->
                    ${pr.milestone != null ? `
                    <span class="issue-meta-section css-truncate issue-milestone ml-2 d-none d-md-inline">
                        <a class="milestone-link Link--muted css-truncate tooltipped tooltipped-n" aria-label="${pr.milestone.title}" href="${pr.milestone.html_url}" data-turbo-frame="repo-content-turbo-frame">
                            <svg aria-label="Milestone" role="img" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-milestone">
                            <path d="M7.75 0a.75.75 0 0 1 .75.75V3h3.634c.414 0 .814.147 1.13.414l2.07 1.75a1.75 1.75 0 0 1 0 2.672l-2.07 1.75a1.75 1.75 0 0 1-1.13.414H8.5v5.25a.75.75 0 0 1-1.5 0V10H2.75A1.75 1.75 0 0 1 1 8.25v-3.5C1 3.784 1.784 3 2.75 3H7V.75A.75.75 0 0 1 7.75 0Zm4.384 8.5a.25.25 0 0 0 .161-.06l2.07-1.75a.248.248 0 0 0 0-.38l-2.07-1.75a.25.25 0 0 0-.161-.06H2.75a.25.25 0 0 0-.25.25v3.5c0 .138.112.25.25.25h9.384Z"></path>
                            </svg>
                            <span class="css-truncate-target">
                            ${pr.milestone.title}
                            </span>
                        </a>
                    </span>` : ''}
                </div>
            </div>
            <div class="flex-shrink-0 col-4 col-md-3 pt-2 text-right pr-3 no-wrap d-flex hide-sm ">
                <span class="ml-2 flex-1 flex-shrink-0"></span>
            ${assignees.length > 0 ? `
                <span class="ml-2 flex-1 flex-shrink-0">
                    <div class="AvatarStack AvatarStack--right ml-2 flex-1 flex-shrink-0">
                        <div class="AvatarStack-body tooltipped tooltipped-sw tooltipped-multiline tooltipped-align-right-1 mt-1" aria-label="Assigned to ${assignees.map(assignee => assignee.username).join(' and ')}">
                            ${assignees.map(assignee => `
                            <a class="avatar avatar-user" aria-label="${assignee.username}’s assigned issues" href="/${assignee.username}/repo/pulls?q=assignee%3A${assignee.username}+is%3Aopen" data-turbo-frame="repo-content-turbo-frame">
                                <img class="from-avatar avatar-user" src="${assignee.avatar_url}" width="20" height="20" alt="@${assignee.username}">
                            </a>`).join('')}
                        </div>
                    </div>
                </span>` : ''}
                <!-- Number Of Comments goes in the span bellow -->
                <span class="ml-2 flex-1 flex-shrink-0"></span>
            </div>
            <a class="d-block d-md-none position-absolute top-0 bottom-0 left-0 right-0" aria-label="${title}" href="/user/repo/pull/${issueNumber}" data-turbo-frame="repo-content-turbo-frame"></a>
        </div>
    </div>
    `;
}
function hexToRgb(hex) {

  // Handle 3-character hex codes
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  // Parse the hex string into RGB values
  let bigint = parseInt(hex, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;

  return { r, g, b };
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export { sortLowest, getArtefact };

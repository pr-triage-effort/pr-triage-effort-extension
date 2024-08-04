import { hexToRgb, rgbToHsl } from './color-utils'

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

  const buildStatusHtml = pr.status === "success" ? `
    <details class="commit-build-statuses details-overlay details-reset js-dropdown-details hx_dropdown-fullscreen js-socket-channel js-updatable-content">
        <summary class="color-fg-success">
            <svg aria-label="15 / 15 checks OK" role="img" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-check">
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
            </svg>
        </summary>
    </details>` : pr.status === "failure" ? `
    <details class="commit-build-statuses details-overlay details-reset js-dropdown-details hx_dropdown-fullscreen js-socket-channel js-updatable-content">
        <summary class="color-fg-danger">
            <svg aria-label="11 / 15 checks OK" role="img" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-x">
                <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
            </svg>
        </summary>
    </details>` : '';


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
                    ${pr.draft == false ? `
                    <svg class="octicon octicon-git-pull-request color-fg-open" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"></path></svg>
                    ` : `
                      < svg class="octicon octicon-git-pull-request-draft color-fg-muted" viewBox = "0 0 16 16" version = "1.1" width = "16" height = "16" aria - hidden="true" > <path d="M3.25 1A2.25 2.25 0 0 1 4 5.372v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.251 2.251 0 0 1 3.25 1Zm9.5 14a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5ZM2.5 3.25a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0ZM3.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm9.5 0a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM14 7.5a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Zm0-4.25a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z"></path></svg >
                    `}
                    </span>
            </div>
            <!-- Issue title column -->
            <div class="flex-auto min-width-0 p-2 pr-3 pr-md-2">
                <!-- Title -->
                <a id="issue_${issueNumber}_link" class="Link--primary v-align-middle no-underline h4 js-navigation-open markdown-title" data-hovercard-type="pull_request" data-hovercard-url="/user/repo/pull/${issueNumber}/hovercard" href="/user/repo/pull/${issueNumber}" data-turbo-frame="repo-content-turbo-frame">${title}</a>
                <!-- BUILD STATUS -->
                ${buildStatusHtml}
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
                <!-- TODO : Review Status -->
              
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
                    <!-- Efforts -->
                    <span class="d-none d-md-inline-flex ml-2">
                        Estimated effort to merge : ${pr.effort}
                    </span>
                </div>
            </div>
            <div class="flex-shrink-0 col-4 col-md-3 pt-2 text-right pr-3 no-wrap d-flex hide-sm ">
                <span class="ml-2 flex-1 flex-shrink-0">
                    ${pr.linkedIssue > 0 ? `
                    <span class="tooltipped tooltipped-sw tooltipped-multiline tooltipped-align-right-1 mt-1" aria-label="${pr.linkedIssue} linked issues">
                        <span class="color-fg-muted" aria-label="${pr.linkedIssue} issues">
                              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-issue-opened v-align-middle">
                                  <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
                              </svg>
                              <span class="text-small text-bold">${pr.linkedIssue} </span>
                            </span>
                        </span>
                    `: ''}
                </span>
                <!-- Asignees icons -->
                <span class="ml-2 flex-1 flex-shrink-0">
                    ${assignees.length > 0 ? `
                    <div class="AvatarStack AvatarStack--right ml-2 flex-1 flex-shrink-0">
                        <div class="AvatarStack-body tooltipped tooltipped-sw tooltipped-multiline tooltipped-align-right-1 mt-1" aria-label="Assigned to ${assignees.map(assignee => assignee.username).join(' and ')}">
                            ${assignees.map(assignee => `
                            <a class="avatar avatar-user" aria-label="${assignee.username}’s assigned issues" href="/${assignee.username}/repo/pulls?q=assignee%3A${assignee.username}+is%3Aopen" data-turbo-frame="repo-content-turbo-frame">
                                <img class="from-avatar avatar-user" src="${assignee.avatar_url}" width="20" height="20" alt="@${assignee.username}">
                            </a>`).join('')}
                        </div>
                    </div>` : ''}
                </span>
                <!-- Number Of Comments -->
                <span class="ml-2 flex-1 flex-shrink-0">
                    ${pr.comments > 0 ? `
                    <a href="${pr.html_url}" class="Link--muted" aria-label="1 comment" data-turbo-frame="repo-content-turbo-frame">
                        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-comment v-align-middle">
                          <path d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 13.25 12H9.06l-2.573 2.573A1.458 1.458 0 0 1 4 13.543V12H2.75A1.75 1.75 0 0 1 1 10.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h4.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
                        </svg>
                        <span class="text-small text-bold">${pr.comments}</span>
                      </a>` : ''}
                </span>
            </div>
            <a class="d-block d-md-none position-absolute top-0 bottom-0 left-0 right-0" aria-label="${title}" href="/user/repo/pull/${issueNumber}" data-turbo-frame="repo-content-turbo-frame"></a>
        </div>
    </div>
    `;
}

export { replaceHtmlContent };

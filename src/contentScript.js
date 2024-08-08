'use strict';
import { sort } from './modules/sort'
import { addSortOrderOptions } from './modules/button-ui'

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

let token = null;
let repo = null;
let greenPriority = null;
let yellowPriority = null;


// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TOKEN') {
    token = request.payload.token;
  } else if (request.type === 'REPO') {
    repo = request.payload.repo;
  } else if (request.type === 'GREEN_PRIORITY') {
    greenPriority = request.payload.repo;
  } else if (request.type === 'YELLOW_PRIORITY') {
    yellowPriority = request.payload.repo;
  }

  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse({});
  return true;
});

const pattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/pulls.*/;

// UI
const observer = new MutationObserver(function (mutationsList, observer) {
  let currentUrl = window.location.href;
  if (pattern.test(currentUrl)) {
    if (!document.querySelector('#sort-select-menu .highest-effort')) {
      addSortOrderOptions('Highest effort', async () => {
        await sort(1);
      });
      addSortOrderOptions('Lowest effort', async () => {
        await sort(0);
      });
    }
  }
})

const target = document.querySelector('#repo-content-turbo-frame');
const config = { attributes: true, childList: true, subtree: true };
observer.observe(target, config);

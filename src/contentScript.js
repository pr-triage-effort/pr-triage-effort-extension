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

// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TOKEN') {
    token = request.payload.token;
    //console.log(`Current token is ${token}`);
  }

  if (request.type === 'REPO') {
    repo = request.payload.repo;
    //console.log(`Current repo is ${repo}`);
  }

  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse({});
  return true;
});


// UI


addSortOrderOptions('Highest effort', async () => {
  await sort(1, token, repo);
});
addSortOrderOptions('Lowest effort', async () => {
  await sort(0, token, repo);
});

'use strict';

import { sortLowest, getArtefact } from './modules/sort.js'

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

/*

// Log `title` of current active web page
const pageTitle = document.head.getElementsByTagName('title')[0].innerHTML;
console.log(
  `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
);

// Communicate with background file by sending a message
chrome.runtime.sendMessage(
  {
    type: 'GREETINGS',
    payload: {
      message: 'Hello, my name is Con. I am from ContentScript.',
    },
  },
  (response) => {
    console.log(response.message);
  }
);

// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'COUNT') {
    console.log(`Current count is ${request.payload.count}`);
  }

  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse({});
  return true;
});

*/

// UI

const sortMenuEl = document.querySelector('#sort-select-menu .SelectMenu-list');
const sortItemEl = sortMenuEl.querySelector('.SelectMenu-divider');
const sortMenuNode = sortItemEl.parentNode;

// Action is the function that will be called on click to order. (need to implement)
function addSortOrderOptions(Option, Action) {
  const sortOptionEl = document.createElement('div');
  const option = Option.replace(/ /g, "-").toLowerCase();

  sortOptionEl.setAttribute('class', `SelectMenu-item ${option}`);
  sortOptionEl.setAttribute('aria-checked', 'false');
  sortOptionEl.setAttribute('role', 'menuitemradio');
  sortOptionEl.innerHTML = `
            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-check SelectMenu-icon SelectMenu-icon--check ${option}"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg>
            <span class="${option}">${Option}</span>
        `;
  sortMenuNode.insertBefore(sortOptionEl, sortItemEl);

  sortMenuEl.addEventListener('click', (event) => {
    if (event.target.classList.contains(option)) {
      Action();
    }
  });
}

addSortOrderOptions('Highest effort', async () => {
  await getArtefact();
  await sortLowest();
});
addSortOrderOptions('Lowest effort', async () => {
  await getArtefact();
  await sortLowest();
});

'use strict';

import './popup.css';
import { infoStorage } from './storage';

(function () {
  document.getElementById('btnShowToken').addEventListener('mousedown', (event) => {
    document.getElementById('userToken').setAttribute('type', 'text');
  });
  document.getElementById('btnShowToken').addEventListener('mouseup', (event) => {
    document.getElementById('userToken').setAttribute('type', 'password');
  });

  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions
  function setupInfo(type, value) {
    const tokenEl = document.getElementById('userToken');
    const repoEl = document.getElementById('userRepo');
    const greenPriorityEl = document.getElementById('greenPriority');
    const yellowPriorityEl = document.getElementById('yellowPriority');

    if (type === 'TOKEN') {
      tokenEl.value = value;
    } else if (type === 'REPO') {
      repoEl.value = value;
    } else if (type === 'GREEN_PRIORITY' && value !== null && value !== undefined) {
      greenPriorityEl.value = value;
    } else if (type === 'YELLOW_PRIORITY' && value !== null && value !== undefined) {
      yellowPriorityEl.value = value;
    } else {
      console.log("Unsupported type " + type + " with value " + value);
    }
  }


  function updateInfo({ token, repo, greenPriority, yellowPriority }) {
    infoStorage.set('token', token, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        chrome.tabs.sendMessage(
          tab.id,
          {
            type: 'TOKEN',
            payload: { token: token },
          },
          (response) => {
            console.log('Current token value passed to contentScript file');
          }
        );
      });
    });

    infoStorage.set('repo', repo, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        chrome.tabs.sendMessage(
          tab.id,
          {
            type: 'REPO',
            payload: { repo: repo },
          },
          (response) => {
            console.log('Current repo value passed to contentScript file');
          }
        );
      });
    });

    infoStorage.set('greenPriority', greenPriority, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        chrome.tabs.sendMessage(
          tab.id,
          {
            type: 'GREEN_PRIORITY',
            payload: { greenPriority: greenPriority },
          },
          (response) => {
            console.log('Current greenPriority value passed to contentScript file');
          }
        );
      });
    });

    infoStorage.set('yellowPriority', yellowPriority, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        chrome.tabs.sendMessage(
          tab.id,
          {
            type: 'YELLOW_PRIORITY',
            payload: { yellowPriority: yellowPriority },
          },
          (response) => {
            console.log('Current yellowPriority value passed to contentScript file');
          }
        );
      });
    });
  }

  function restoreInfo() {
    infoStorage.get('token', (token) => {
      if (typeof token === 'undefined') {
        infoStorage.set('token', null, () => {
          setupInfo('TOKEN', null);
          console.log('im here tok null');
        });
      } else {
        setupInfo('TOKEN', token);
      }
    });

    infoStorage.get('repo', (repo) => {
      if (typeof repo === 'undefined') {
        infoStorage.set('repo', null, () => {
          setupInfo('REPO', null);
          console.log('im here tok null');
        });
      } else {
        setupInfo('REPO', repo);
      }
    });

    infoStorage.get('greenPriority', (greenPriority) => {
      if (typeof greenPriority === 'undefined') {
        infoStorage.set('greenPriority', null, () => {
          setupInfo('GREEN_PRIORITY', null);
        });
      } else {
        setupInfo('GREEN_PRIORITY', greenPriority);
      }
    });

    infoStorage.get('yellowPriority', (yellowPriority) => {
      if (typeof yellowPriority === 'undefined') {
        infoStorage.set('yellowPriority', null, () => {
          setupInfo('YELLOW_PRIORITY', null);
        });
      } else {
        setupInfo('YELLOW_PRIORITY', yellowPriority);
      }
    });

    document.getElementById('userForm').addEventListener('submit', (event) => {
      event.preventDefault(); // Prevent form submission
      const tokenEl = document.getElementById('userToken');
      const repoEl = document.getElementById('userRepo');
      const greenPriorityEl = document.getElementById('greenPriority');
      const yellowPriorityEl = document.getElementById('yellowPriority');

      updateInfo({
        token: tokenEl.value,
        repo: repoEl.value,
        greenPriority: greenPriorityEl.value,
        yellowPriority: yellowPriorityEl.value,
      });
      alert("Information saved successfully");
    });
  }

  document.addEventListener('DOMContentLoaded', restoreInfo);

})();

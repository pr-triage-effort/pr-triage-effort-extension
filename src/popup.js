'use strict';

import './popup.css';

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

  const infoStorage = {
    get: (key, cb) => {
      chrome.storage.sync.get([key], (result) => {
        cb(result[key]);
      });
    },
    set: (key, value, cb) => {
      chrome.storage.sync.set(
        {
          [key]: value
        },
        () => {
          cb();
        }
      );
    },
  };


  function setupInfo(type, value) {
    const tokenEl = document.getElementById('userToken');
    const repoEl = document.getElementById('userRepo');

    if (type === 'TOKEN') {
      tokenEl.value = value;
    } else {
      repoEl.value = value;
    }

    console.log("type: " + type);
    console.log("value: " + value)
  }

  function updateInfo({ token, repo }) {
    infoStorage.set('token', token, () => {
      // Communicate with content script of
      // active tab by sending a message
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];

        chrome.tabs.sendMessage(
          tab.id,
          {
            type: 'TOKEN',
            payload: {
              token: token,
            },
          },
          (response) => {
            console.log('Current token value passed to contentScript file');
          }
        );
      });
    });

    infoStorage.set('repo', repo, () => {
      // Communicate with content script of
      // active tab by sending a message
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];

        chrome.tabs.sendMessage(
          tab.id,
          {
            type: 'REPO',
            payload: {
              repo: repo,
            },
          },
          (response) => {
            console.log('Current token value passed to contentScript file');
          }
        );
      });
    });

    console.log(token + ' // ' + repo);
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

    document.getElementById('userForm').addEventListener('submit', (event) => {
      const tokenEl = document.getElementById('userToken');
      const repoEl = document.getElementById('userRepo');

      updateInfo({ token: tokenEl.value, repo: repoEl.value });
    });
  }

  document.addEventListener('DOMContentLoaded', restoreInfo);

  // Communicate with background file by sending a message
  chrome.runtime.sendMessage(
    {
      type: 'GREETINGS',
      payload: {
        message: 'Hello, my name is Pop. I am from Popup.',
      },
    },
    (response) => {
      console.log(response.message);
    }
  );
})();

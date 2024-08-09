export const infoStorage = {
  get: (key, cb) => {
    chrome.storage.sync.get([key], (result) => {
      cb(result[key]);
    });
  },
  set: (key, value, cb) => {
    chrome.storage.sync.set(
      {
        [key]: value,
      },
      () => {
        cb();
      }
    );
  },
};

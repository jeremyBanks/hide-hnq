'use strict';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request) {
  case 'getOptions':
    chrome.storage.sync.get({
      'options': null
    }, (data) => {
      sendResponse(data.options);
    });

    return true; // to allow for async sendResponse call.
    break;

  case 'openOptionsPage':
    chrome.runtime.openOptionsPage();
    sendResponse(null);

    break;

  default:
    console.error("Got unexpected request " + request);
  }
});

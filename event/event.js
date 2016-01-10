~/*
  Event/non-persistent background page
*/function() {
'use strict';

const defaultOptions = Object.freeze({
  hideAll: true,
  matchMode: 'blacklist', 
  matchSites: [],
  matchStrings: [],
  hideIfAllHidden: false,
  showOptionsLink: true,
  alsoHide: 'none'
});

const handlers = {
  getOptions() {
    return new Promise(resolve => chrome.storage.sync.get({
      'options': {}
    }, data => {
      const fullOptions = Object.assign({}, defaultOptions, data['options']);
      resolve(fullOptions);
    }));
  },

  setOptions(options) {
    const fullOptions = Object.assign({}, defaultOptions, options);
    return new Promise(resolve => chrome.storage.sync.set({
      'options': fullOptions
    }, () => {
      resolve(fullOptions);
    }));
  },

  openOptionsPage() {
    chrome.runtime.openOptionsPage();
  }
};


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const result = handlers[request[0]].apply(handlers, request.slice(1));
  Promise.resolve(result).then(sendResponse);
  return true;
});

}();

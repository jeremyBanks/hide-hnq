~function() {
'use strict';

const domContentLoaded = new Promise(
  resolve => void document.addEventListener('DOMContentLoaded', resolve));

const gotOptions = new Promise(
  resolve => void chrome.storage.sync.get({
    options: {
      hideAll: true,
      matchMode: 'blacklist',
      matchSites: [],
      matchStrings: [],
      hideIfAllHidden: false,
      showOptionsLink: true
    }
  }, data => resolve(data.options)));

Promise.all([domContentLoaded, gotOptions]).then(results => {
  const options = results[1] || {};
  console.log("options", options);

  const form = document.querySelector('form');

  form.sites.value = options.matchSites && options.matchSites.join('\n') || '';
  form.strings.value = options.matchStrings && options.matchStrings.join('\n') || '';
  form.showOptionsLink.checked = options.showOptionsLink;
  form.hideSectionIfEmpty.checked = options.hideIfAllHidden;

  form.matchModeBlacklist.checked = options.matchMode === 'blacklist';
  form.matchModeWhitelist.checked = options.matchMode !== 'blacklist';

  form.blockModeAll.checked = options.hideAll;
  form.blockModeSome.checked = !options.hideAll;

  document.body.dataset.uninitialized = 'false';

  let potentiallyChanged = false;

  // storage.sync is throttled, so we don't want to go *too* fast.
  setInterval(() => {
    if (!potentiallyChanged) return;

    potentiallyChanged = false;

    const options = {
      hideAll: form.blockMode.value === 'all',
      matchMode: form.matchMode.value,
      matchSites:
          form.sites.value.split(/\n/g).map(s => s.trim()).filter(s => s),
      matchStrings:
          form.strings.value.split(/\n/g).map(s => s.trim()).filter(s => s),
      hideIfAllHidden: form.hideSectionIfEmpty.checked,
      showOptionsLink: form.showOptionsLink.checked
    };

    chrome.storage.sync.set({options: options}, () => {
      document.body.classList.remove('dirty');
      console.log("saved options", options);
    });
  }, 750);

  const onPotentialChange = () => {
    document.body.classList.add('dirty');
    potentiallyChanged = true;
  };

  form.addEventListener('input', onPotentialChange);
  form.addEventListener('change', onPotentialChange);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onPotentialChange();
  });
});

}();

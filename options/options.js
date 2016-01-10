~/*
  Options page/dialog behaviour
*/function() {
'use strict';

const domContentLoaded = new Promise(
  resolve => void document.addEventListener('DOMContentLoaded', resolve));

const gotOptions = new Promise(
  resolve => chrome.runtime.sendMessage(['getOptions'], resolve));

Promise.all([domContentLoaded, gotOptions]).then(results => {
  const options = results[1] || {};
  console.log("loaded options", options);

  const form = document.querySelector('form');

  form.sites.value = options.matchSites && options.matchSites.join('\n') || '';
  form.strings.value = options.matchStrings && options.matchStrings.join('\n') || '';
  form.showOptionsLink.checked = options.showOptionsLink;
  form.hideSectionIfEmpty.checked = options.hideIfAllHidden;

  form.matchModeBlacklist.checked = options.matchMode === 'blacklist';
  form.matchModeWhitelist.checked = options.matchMode !== 'blacklist';

  if (options.alsoHide === 'bulletin') {
    form.alsoHideBulletin.checked = true;
  } else if (options.alsoHide === 'meta') {
    form.alsoHideMeta.checked = true;
  } else {
    form.alsoHideNothing.checked = true;
  }

  form.blockModeAll.checked = options.hideAll;
  form.blockModeSome.checked = !options.hideAll;

  document.body.dataset.uninitialized = 'false';

  // storage.sync is throttled, so we don't want to go *too* fast.
  const saveChanges = util.throttled(750, () => {
    const options = {
      hideAll: form.blockMode.value === 'all',
      matchMode: form.matchMode.value,
      matchSites:
          form.sites.value.split(/\n/g).map(s => s.trim()).filter(s => s),
      matchStrings:
          form.strings.value.split(/\n/g).map(s => s.trim()).filter(s => s),
      hideIfAllHidden: form.hideSectionIfEmpty.checked,
      showOptionsLink: form.showOptionsLink.checked,
      alsoHide: form.alsoHide.value
    };

    return new Promise(
      resolve => chrome.runtime.sendMessage(['setOptions', options], resolve));
  });

  const onPotentialChange = () => {
    document.body.classList.add('dirty');
    console.log("preparing to save options");
    saveChanges().then(options => {
      document.body.classList.remove('dirty');
      console.log("saved options", options);
    });
  };

  form.addEventListener('input', onPotentialChange);
  form.addEventListener('change', onPotentialChange);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onPotentialChange();
  });
});

}();

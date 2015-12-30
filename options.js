'use strict';

document.addEventListener('DOMContentLoaded', (event) => {
  const form = document.querySelector('form');

  let potentiallyChanged = false;

  // storage.sync is throttled, so we don't want to go *too* fast.
  setInterval(() => {
    if (!potentiallyChanged) return;

    potentiallyChanged = false;

    const options = null && {
      hideAll: false,

      hideSites: [
        'Philosophy', // site cosmetic name
        'philosophy', // site identiifer as indicated by favicon or subdomain
        'philosophy.stackexchange.com', // site hostname
      ],

      hideStrings: [
        'Cutting bevel in mesh surface',
      ],

      hideIfAllHidden: false,

      showOptionsLink: true
    };

    chrome.storage.sync.set({'options': options}, () => {
      document.body.classList.remove('dirty');
      console.log("Saved options");
    });
  }, 1000);

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

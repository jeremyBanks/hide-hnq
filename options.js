'use strict';

document.addEventListener('DOMContentLoaded', (event) => {
  const onPotentialChange = () => {
    const options = {
      hideAll: false,

      hideSites: [
        'Philosophy', // site cosmetic name
        'philosophy', // site identiifer as indicated by favicon or subdomain
        'philosophy.stackexchange.com', // site hostname
      ],

      hideStrings: [
        'Cutting bevel in mesh surface',
      ],

      hideIfAllhidden: true,

      showOptionsLink: true
    };

    chrome.storage.sync.set({'options': options}, () => {
      console.log("Saved options");
    });
  };

  const form = document.querySelector('form');

  form.addEventListener('change', onPotentialChange);
  form.addEventListener('input', onPotentialChange);
  form.addEventListener('click', onPotentialChange);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onPotentialChange();
  });
});

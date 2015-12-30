~function() {
'use strict';

const options = {
  hideAll: false,
  
  hideSites: [
    'Philosophy', // site cosmetic name
    'philosophy', // site identiifer as indicated by favicon or subdomain
    'philosophy.stackexchange.com', // site hostname
  ],
  
  hideStrings: [
    'Cutting bevel in mesh surface',
  ]
}

const hnq = document.querySelector('#hot-network-questions');

if (!options.hideAll) {
  const items = new Set(Array.from(document.querySelectorAll('li')));
  const visibleItems = new Set(items);
  const hiddenItems = new Set();

  if (!('update_url' in chrome.runtime.getManifest())) {
    console.log("Debug mode enabled for Block Hot Network Question on Stack Exchange.");
  } else {
    console.debug = function() {};
    console.log = function() {};
    console.warning = function() {};
    console.error = function() {};
  }

  // A model of efficiency.
  for (const item of items) {
    const icon = item.querySelector('.favicon');
    const link = item.querySelector('a');

    let hide = false;

    if (!hide) for (const site of options.hideSites) {
      if (icon && icon.title === site) {
        hide = true;
        console.debug("Hiding", item, "because icon.title is", site);
      } else if (
        icon && !/ /.test(icon) &&
        icon.classList.contains(`favicon-${site}`)
      ) {
        hide = true;
        console.debug("Hiding", item, "because icon.classList contains", `favicon-${site}`);
      } else if (link.hostname === site) {
        hide = true;
        console.debug("Hiding", item, "because link.hostname is", site);
      }
    }

    if (!hide) for (const keyword of options.hideStrings) {
      // Clbuttic.
      if (link.textContent.indexOf(keyword) > -1) {
        console.debug("Hiding", item, "because link.textContent contains", keyword);
        hide = true;
      }
    }
  
    if (hide) {
      visibleItems.delete(item);
      hiddenItems.add(item);
      item.dataset.jbsehnqHidden = 'true';
    }
  }
  
  if (visibleItems.size > 0) {
    hnq.dataset.jbsehnqHidden = 'false';
  }
}

}();

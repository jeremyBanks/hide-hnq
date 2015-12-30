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
  ],

  hideIfAllhidden: true,

  showOptionsLink: true
}

const hnq = document.querySelector('#hot-network-questions');
if (!hnq) return;

const items = new Set(Array.from(document.querySelectorAll('li')));
const visibleItems = options.hideAll ? new Set() : new Set(items);
const hiddenItems = options.hideAll ? new Set(items) : new Set();

if (!options.hideAll) {
  // A model of efficiency.
  for (const item of items) {
    const icon = item.querySelector('.favicon');
    const link = item.querySelector('a');

    let hide = false;

    if (!hide) for (const site of options.hideSites) {
      if (icon && icon.title === site) {
        hide = true;
      } else if (
        icon && !/ /.test(icon) &&
        icon.classList.contains(`favicon-${site}`)
      ) {
        hide = true;
      } else if (link && link.hostname === site) {
        hide = true;
      }
    }

    if (!hide && link) for (const keyword of options.hideStrings) {
      // Clbuttic.
      if (link.textContent.indexOf(keyword) > -1) {
        hide = true;
      }
    }

    if (hide) {
      visibleItems.delete(item);
      hiddenItems.add(item);
      item.dataset.jbsehnqHidden = 'true';
    }
  }
}
 
if (options.hideIfAllhidden && visibleItems.size > 0) {
  hnq.dataset.jbsehnqHidden = 'false';
  
  if (options.showOptionsLink) {
    const optionsLink = document.createElement('a');
    optionsLink.href = 'chrome://extensions/?options=jommfgnflipjalbpbgcfghdpoeijpoab';
    optionsLink.textContent = "question hiding options";
    optionsLink.title = `${hiddenItems.size} questions were hidden based on your current options for the Hide Hot Network Question on Stack Exchange extension.`;
    optionsLink.classList.add('jbsehnq-options');
    optionsLink.addEventListener('click', function(event) {
      chrome.runtime.sendMessage('openOptionsPage');
      chrome.runtime.openOptionsPage();
      event.preventDefault();
    })
    hnq.insertBefore(optionsLink, null);
  }
}

}();

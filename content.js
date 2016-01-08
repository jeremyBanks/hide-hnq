~function() {
'use strict';

const hnq = document.querySelector('#hot-network-questions');

// We must do this before calling sendMessage to avoid instantiating the
// background page unnecessarily.
if (!hnq) return;

const gotOptions = new Promise(
  resolve => chrome.runtime.sendMessage('getOptions', resolve));

gotOptions.then(options => {
  try {
    if (!options) {
      // TODO: avoid manually duplicating this in both places
      options = {
        hideAll: true,
        matchMode: 'blacklist',
        matchSites: [],
        matchStrings: [],
        hideIfAllHidden: false,
        showOptionsLink: true
      };
    }

    const items = new Set(Array.from(document.querySelectorAll('li')));
    const visibleItems = options.hideAll ? new Set() : new Set(items);
    const hiddenItems = options.hideAll ? new Set(items) : new Set();

    if (!(options.hideAll && options.hideIfAllHidden)) {
      // Not tremendously efficient.

      for (const item of items) {
        const icon = item.querySelector('.favicon');
        const link = item.querySelector('a');

        let matched = options.hideAll && options.matchMode === 'blacklist';

        if (!matched && options.matchSites) for (const siteInput of options.matchSites) {
          const site = siteInput.toLowerCase();
          const iconTitle = icon && icon.title.toLowerCase();

          if (iconTitle && (iconTitle === site ||
                            iconTitle.replace(/ stack exchange$/, '') === site ||
                            iconTitle.replace(/ answers$/, '') === site)) {
            matched = true;
          } else if (
            icon && !/ /.test(site) &&
            icon.classList.contains(`favicon-${site}`)
          ) {
            matched = true;
          } else if (link && (link.hostname === site ||
                              link.hostname.replace(/\.stackexchange\.com$/) === site ||
                              link.hostname.replace(/\.com$/) === site ||
                              (site === 'current' &&
                               link.hostname === location.hostname.replace(/^meta\./, '')))) {
            matched = true;
          }
        }

        if (!matched && link && options.matchStrings) for (const keyword of options.matchStrings) {
          // Clbuttic.
          if (link.textContent.indexOf(keyword) > -1) {
            matched = true;
          }
        }

        if ((options.matchMode === 'blacklist' && matched) ||
            (options.matchMode !== 'blacklist' && !matched)) {
          visibleItems.delete(item);
          hiddenItems.add(item);
          item.dataset.jbsehnqHidden = 'true';
        }
      }
    }

    if (visibleItems.size == 0) {
      hnq.querySelector('a.show-more').dataset.jbsehnqHidden = 'true';
    }

    if (!options.hideIfAllHidden || visibleItems.size > 0) {
      hnq.dataset.jbsehnqHidden = 'false';

      if (options.showOptionsLink) {
        const optionsLink = document.createElement('a');
        optionsLink.href = 'chrome://extensions/?options=jommfgnflipjalbpbgcfghdpoeijpoab';
        optionsLink.textContent = "question hiding options";
        optionsLink.title = `${hiddenItems.size} questions were hidden based on your current options for the Hide Hot Network Question on Stack Exchange extension.`;
        optionsLink.classList.add('jbsehnq-options');
        optionsLink.addEventListener('click', (event) => {
          event.preventDefault();
          chrome.runtime.sendMessage('openOptionsPage');
        })
        hnq.insertBefore(optionsLink, null);
      }
    }

    console.info(hiddenItems.size, " hot network questions (", hiddenItems, ") hidden by chrome://extensions/?options=jommfgnflipjalbpbgcfghdpoeijpoab");
  } catch (error) {
    // In case of error, we'll set this to make everything visible again.
    hnq.dataset.jbsehnqError = String(error);

    console.error(error);
    throw error;
  }
});

}();

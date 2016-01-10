~function() {
'use strict';

const hnq = document.querySelector('#hot-network-questions');

// We check this before calling sendMessage to avoid instantiating the
// background page unnecessarily.
if (!hnq) return;

const gotOptions = new Promise(
  resolve => chrome.runtime.sendMessage(['getOptions'], resolve));

gotOptions.then(options => {
  try {
    const items = new Set(Array.from(hnq.querySelectorAll('li')));
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

    // handling "more hot questions"

    // HACK: we assume that [style] definitely corresponds to style="display: list-item"

    const numIntendedVisible =
        hnq.querySelectorAll('li:not(.dno):not(.js-hidden),li[style]').length;
    let numVisible =
        hnq.querySelectorAll('li:not([data-jbsehnq-hidden=true]):not(.dno):not(.js-hidden),li:not([data-jbsehnq-hidden=true])[style]').length;
    const potentialReveals =
      Array.from(hnq.querySelectorAll('li:not([data-jbsehnq-hidden=true]).dno.js-hidden:not([style])'));

    while (potentialReveals.length && numVisible < numIntendedVisible) {
      const revealed = potentialReveals.pop();
      revealed.classList.remove('dno');
      revealed.classList.remove('js-hidden');
      numVisible++;
    }

    if (potentialReveals.length === 0) {
      hnq.querySelector('a.show-more').dataset.jbsehnqHidden = 'true';
    }

    // hiding and link options

    if (!options.hideIfAllHidden || visibleItems.size > 0) {
      hnq.dataset.jbsehnqHidden = 'false';
    }

    if (options.showOptionsLink) {
      const optionsLink = document.createElement('a');
      optionsLink.href = 'chrome://extensions/?options=jommfgnflipjalbpbgcfghdpoeijpoab';
      optionsLink.textContent = "hot question filters";
      optionsLink.title = `${hiddenItems.size} questions were hidden based on your current options for the Hide Hot Network Question on Stack Exchange extension.`;
      optionsLink.classList.add('jbsehnq-options');
      optionsLink.addEventListener('click', (event) => {
        event.preventDefault();
        chrome.runtime.sendMessage(['openOptionsPage']);
      })
      hnq.insertBefore(optionsLink, null);
    }

    console.info(hiddenItems.size, " hot network questions (", Array.from(hiddenItems), ") hidden by chrome://extensions/?options=jommfgnflipjalbpbgcfghdpoeijpoab");
  } catch (error) {
    // In case of error, we'll set this to make everything visible again.
    hnq.dataset.jbsehnqError = String(error);

    console.error(error);
    throw error;
  }
});

}();

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
      options = {
        hideAll: true,
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

        let hide = options.hideAll;

        if (!hide && options.hideSites) for (const siteInput of options.hideSites) {
          const site = siteInput.toLowerCase();
          const iconTitle = icon && icon.title.toLowerCase();

          if (iconTitle === site || iconTitle.replace(/ stack exchange$/, '') === site) {
            hide = true;
          } else if (
            icon && !/ /.test(icon) &&
            icon.classList.contains(`favicon-${site}`)
          ) {
            hide = true;
          } else if (link && (link.hostname === site ||
                              link.hostname.replace(/\.stackexchange\.com$/) === site)) {
            hide = true;
          }
        }

        if (!hide && link && options.hideStrings) for (const keyword of options.hideStrings) {
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
  } catch (error) {
    // In case of error, we'll set this to make everything visible again.
    hnq.dataset.jbsehnqError = String(error);
    console.error(error);
    throw error;
  }
});

}();

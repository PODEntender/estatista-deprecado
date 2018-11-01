'use strict';

module.exports = {
  replaceRules: {
    // Replace all internal links
    ':\/\/podentender.com': '://estatista.podentender.com',

    // Undo replace for ajax search
    'name="pp_homepage_url" value="https:\/\/podentender.com': 'name="pp_homepage_url" value="https://internal.podentender.com',
  }
};

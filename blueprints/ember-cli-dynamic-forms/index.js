'use strict';

module.exports = {
  normalizeEntityName: function () { /*no-op*/ },

  afterInstall: function () {
    return this.addBowerPackagesToProject([
      { name: 'jquery', target: '>=1.11.3' },
      { name: 'alpaca', target: '1.5.14' },
      { name: 'handlebars', target: '3.0.3' },

      { name: 'lodash', target: '~4.6.1' }
    ]);
  }
};

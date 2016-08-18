/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-cli-dynamic-forms',
  included: function (app) {
    this._super.included(app);
    app.import(app.bowerDirectory + '/handlebars/handlebars.js');
    app.import(app.bowerDirectory + '/bootstrap/dist/js/bootstrap.js');
    app.import(app.bowerDirectory + '/bootstrap/dist/css/bootstrap.css');
    app.import('bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff', {
      destDir: 'fonts'
    });
    app.import('bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.eot', {
      destDir: 'fonts'
    });
    app.import('bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.svg', {
      destDir: 'fonts'
    });
    app.import('bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf', {
      destDir: 'fonts'
    });
    app.import('bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff2', {
      destDir: 'fonts'
    });

    app.import(app.bowerDirectory + '/alpaca/dist/alpaca/bootstrap/alpaca.js');
    app.import(app.bowerDirectory + '/alpaca/dist/alpaca/bootstrap/alpaca.css');
    app.import(app.bowerDirectory + '/lodash/lodash.js');


  },
  isDevelopingAddon: function () {
    return true;
  }
};

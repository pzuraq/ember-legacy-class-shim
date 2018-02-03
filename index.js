/* eslint-env node */
'use strict';

const VersionChecker = require('ember-cli-version-checker');

module.exports = {
  name: 'ember-legacy-class-shim',

  included(parent) {
    this._super.included.apply(this, arguments);
    this._ensureFindHost();

    let host = this._findHost()

    // Create a root level version checker for checking the Ember version later on
    const emberChecker = new VersionChecker(host).forEmber();

    if (!emberChecker.isAbove('2.13.0')) {
      host.import('vendor/ember-legacy-class-shim.js');
    } else if (parent === host) {
      // The shim is being used in an application, and no longer needed
      host.project.ui.writeWarnLine(
        'ember-legacy-class-shim: This shim is not needed for Ember >= 2.13.0'
      );
    }
  },

  _ensureFindHost() {
    if (!this._findHost) {
      this._findHost = function findHostShim() {
        let current = this;
        let app;
        do {
          app = current.app || app;
        } while (current.parent.parent && (current = current.parent));
        return app;
      };
    }
  }
};

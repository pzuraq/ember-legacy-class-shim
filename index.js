/* eslint-env node */
'use strict';

const path = require('path');
const VersionChecker = require('ember-cli-version-checker');

function requireTransform(transformName) {
  let plugin = require(transformName);

  plugin = plugin.__esModule ? plugin.default : plugin;

  // adding `baseDir` ensures that broccoli-babel-transpiler does not
  // issue a warning and opt out of caching
  let pluginPath = require.resolve(`${transformName}/package`);
  let pluginBaseDir = path.dirname(pluginPath);
  plugin.baseDir = () => pluginBaseDir;

  return plugin;
}

function hasPlugin(plugins, name) {
  for (let maybePlugin of plugins) {
    let plugin = Array.isArray(maybePlugin) ? maybePlugin[0] : maybePlugin;
    let pluginName = typeof plugin === 'string' ? plugin : plugin.name;

    if (pluginName === name) {
      return true;
    }
  }

  return false;
}

module.exports = {
  name: 'ember-decorators',

  init(parent, project) {
    this._super.init.apply(this, arguments);

    // Create a root level version checker for checking the Ember version later on
    this.emberChecker = new VersionChecker({ project, root: project.root }).forEmber();

    // Create a parent checker for checking the parent app/addons dependencies (for things like polyfills)
    const babelChecker = new VersionChecker(parent).for('ember-cli-babel', 'npm');

    if (!babelChecker.satisfies('^6.0.0-beta.1')) {
      project.ui.writeWarnLine(
        'ember-legacy-class-transform: You are using an unsupported ember-cli-babel version, ' +
        'legacy class transform will not be included automatically'
      );

      this._registeredWithBabel = true;
    } else if (this.emberChecker.isAbove('2.13.0') && parent.isEmberCLIProject) {
      // The transform is being used in an application, and no longer needed
      project.ui.writeWarnLine(
        'ember-legacy-class-transform: this transform is not needed for Ember >= 2.13.0'
      );

      this._registeredWithBabel = true;
    }

    // Parent can either be an Addon or Project. If it is a Project, then ember-decorators is
    // being included in a root level project and needs to register itself on the EmberApp or
    // EmberAddon's options instead
    if (!parent.isEmberCLIProject) {
      this.registerTransformWithParent(parent);
    }
  },

  included(app) {
    this._super.included.apply(this, arguments);

    // This hook only gets called from top level applications. If it is called and the addon
    // has not already registered itself, it should register itself with the application
    this.registerTransformWithParent(app);
  },

  /**
   * Registers the legacy class transform with the parent addon or application.
   *
   * @param {Addon|EmberAddon|EmberApp} parent
   */
  registerTransformWithParent(parent) {
    if (this._registeredWithBabel) return;

    const parentOptions = parent.options = parent.options || {};
    const EmberLegacyClassConstructor = requireTransform('babel-plugin-ember-legacy-class-constructor');

    // Create babel options if they do not exist
    parentOptions.babel = parentOptions.babel || {};

    // Create and pull off babel plugins
    const plugins = parentOptions.babel.plugins = parentOptions.babel.plugins || [];

    if (!hasPlugin(plugins, 'ember-legacy-class-constructor')) {
      plugins.push(EmberLegacyClassConstructor);
    }

    this._registeredWithBabel = true;
  }
};

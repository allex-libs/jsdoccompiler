function createJSDocableDirWatcher (execlib, EntityWatcher, FileWatcher, DirWatcher, JSDocCompileJob, TutorialsCheckerMixin, Node, fsjobslib) {
  'use strict';

  var lib = execlib.lib,
    qlib = lib.qlib;

  function ConfigFileWatcher (path) {
    FileWatcher.call(this, path);
  }
  lib.inherit(ConfigFileWatcher, FileWatcher);
  ConfigFileWatcher.prototype.eventTimeouts = {selfdestruct: 200, change: 200};

  function JSDocableSubdirWatcher (path, filter) {
    DirWatcher.call(this, path, filter);
  }
  lib.inherit(JSDocableSubdirWatcher, DirWatcher);
  JSDocableSubdirWatcher.prototype.eventTimeouts = {selfdestruct: 200, change: 200};

  function JSDocableDirWatcher (path, outpath, webroot, starteddefer) {
    EntityWatcher.call(this, path, starteddefer);
    TutorialsCheckerMixin.call(this);
    this.configWatcher = null;
    this.configChangedListener = null;
    this.watchConfig();
    this.outpath = outpath;
    this.webroot = webroot;
    this.dirwatchers = null;
    this.jobs = new qlib.JobCollection();
    this.processConfig();
  }
  lib.inherit(JSDocableDirWatcher, EntityWatcher);
  TutorialsCheckerMixin.addMethods(JSDocableDirWatcher);
  JSDocableDirWatcher.prototype.__cleanUp = function () {
    if (this.jobs) {
      this.jobs.destroy();
    }
    this.jobs = null;
    this.purgeDirWatchers();
    this.webroot = null;
    this.outpath = null;
    if (this.configChangedListener) {
      this.configChangedListener.destroy();
    }
    this.configChangedListener = null;
    if (this.configWatcher) {
      this.configWatcher.destroy();
    }
    this.configWatcher = null;
    TutorialsCheckerMixin.prototype.destroy.call(this);
    EntityWatcher.prototype.__cleanUp.call(this);
  };
  JSDocableDirWatcher.prototype.purgeDirWatchers = function () {
    var dirws = this.dirwatchers;
    this.dirwatchers = null;
    if (dirws) {
      lib.arryDestroyAll(dirws);
    }
  };
  JSDocableDirWatcher.prototype.watchConfig = function () {
    if (this.configWatcher) {
      this.configWatcher.destroy();
    }
    if (this.configChangedListener) {
      this.configChangedListener.destroy();
    }
    this.configWatcher = new ConfigFileWatcher([this.path, 'jsdocconfig.json']);
    this.configChangedListener = this.configWatcher.changed.attach(this.onConfigChanged.bind(this));
    this.configWatcher.destroyed.attachForSingleShot(this.destroy.bind(this));
  };
  JSDocableDirWatcher.prototype.onConfigChanged = function () {
    console.log('Config changed in', this.path);
    this.processConfig();
  };
  JSDocableDirWatcher.prototype.doRecompile = function () {
    if (!(this.jobs && this.path && this.outpath && this.webroot)) {
      return;
    }
    this.jobs.run('.', new JSDocCompileJob(this.path, this.outpath, this.webroot)).then(
      console.log.bind(console, 'compile ok'),
      console.error.bind(console, 'Compile ooops')
    );
  };
  JSDocableDirWatcher.prototype.processConfig = function () {
    this.purgeDirWatchers();
    this.dirwatchers = [];
    this.jobs.run('.', new fsjobslib.ReadJsonFileJob(this.configWatcher.path)).then(
      this.onConfigContents.bind(this),
      console.error.bind(console, 'ooops')
    );
  };
  JSDocableDirWatcher.prototype.onConfigContents = function (config) {
    var includePattern;
    if (!(config && config.source && config.source.include)) {
      return;
    }
    console.log('config', config);
    includePattern = config.source.includePattern || '.+\\js?$';
    if (lib.isArray(config.source.include)) {
      config.source.include.forEach(this.produceDirWatcher.bind(this, includePattern));
    }
    this.checkForTutorials(this.onTutorialsChecked.bind(this), null, this.path, config);
  };
  JSDocableDirWatcher.prototype.onTutorialsChecked = function () {
    if (this.tutorialspath) {
      this.produceDirWatcher('\.(?:html|htm|json|markdown|md|xhtml|xml)$', Node.Path.basename(this.tutorialspath));
    }
    this.doRecompile();
  };
  JSDocableDirWatcher.prototype.produceDirWatcher = function (includePattern, dirname) {
    var dirw;
    try {
      dirw = new JSDocableSubdirWatcher([this.path, dirname], new RegExp(includePattern));
      dirw.changed.attach(this.dirChanged.bind(this));
      this.dirwatchers.push(dirw);
    } catch(e) {
      console.log('aha!!', e);
    }
  };
  JSDocableDirWatcher.prototype.dirChanged = function () {
    if (!this.dirwatchers) {
      return;
    }
    this.doRecompile();
  };

  return JSDocableDirWatcher;
}

module.exports = createJSDocableDirWatcher;

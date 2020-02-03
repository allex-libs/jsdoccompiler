var child_proc = require('child_process');
function createJSDocCompileJob (execlib, fsjobslib, Node, TutorialsCheckerMixin) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    JobBase = qlib.JobBase,
    ReadJsonFileJob = fsjobslib.ReadJsonFileJob,
    DirExistsJob = fsjobslib.DirExistsJob,
    WriteJsonFileJob = fsjobslib.WriteJsonFileJob,
    RmFileJob = fsjobslib.RmFileJob;

  function JSDocCompileJob (modulepath, outpath, webroot, defer) {
    JobBase.call(this,defer);
    this.modulepath = absolutize(modulepath);
    this.outpath = absolutize(outpath);
    this.webroot = webroot;
    this.tempconffilename = Node.Path.join(this.outpath, lib.uid());
  }
  lib.inherit(JSDocCompileJob, JobBase);
  TutorialsCheckerMixin.addMethods(JSDocCompileJob);
  JSDocCompileJob.prototype.destroy = function () {
    this.tempconffilename = null;
    this.webroot = null;
    this.outpath = null;
    this.modulepath = null;
    TutorialsCheckerMixin.prototype.destroy.call(this);
    JobBase.prototype.destroy.call(this);
  };
  JSDocCompileJob.prototype.go = function () {
    var ret;
    if (!this.defer) {
      return q.reject(new lib.Error('ALREADY_DESTROYED', 'The instance of '+this.constructor.name+' is already destroyed'));
    }
    ret = this.defer.promise;
    (new ReadJsonFileJob([this.modulepath, 'jsdocconfig.json'])).go().then(
      this.onConfig.bind(this),
      this.reject.bind(this)
    );
    return ret;
  };
  JSDocCompileJob.prototype.onConfig = function (config) {
    translateConfig(config, this.modulepath, this.outpath, this.webroot);
    (new WriteJsonFileJob(config, {path: this.tempconffilename, encoding: 'utf8'})).go().then(
      //this.runCompile.bind(this),
      this.checkForTutorials.bind(this, this.runCompile.bind(this), this.reject.bind(this), this.modulepath, config),
      this.reject.bind(this)
    );
    //this.resolve(true);
  };
  JSDocCompileJob.prototype.runCompile = function () {
    var command = 'jsdoc -c '+this.tempconffilename;
    if (this.tutorialspath) {
      command += (' -u '+this.tutorialspath);
    }
    Node.executeCommand(command, null, {cwd:process.cwd()}).then(
      this.onCompileDone.bind(this),
      this.reject.bind(this)
    );
  };
  JSDocCompileJob.prototype.onCompileDone = function () {
    qlib.promise2defer((new RmFileJob(this.tempconffilename)).go(), this);
  };

  function absolutize (path) {
    return Node.absolutizePath(path);
  }

  function absolutizeModulePath (modulepath, subpath) {
    return absolutize(Node.Path.join(modulepath, subpath));
  }

  function translateConfig(config, modulepath, outpath, webroot) {
    config.opts = config.opts || {};
    config.opts.destination = Node.Path.join(outpath, Node.Path.basename(modulepath));
    config.plugins = config.plugins || [];
    config.source = config.source || {};
    config.allex = {root:webroot};
    if (lib.isArray(config.source.include)) {
      config.source.include = config.source.include.map(absolutizeModulePath.bind(null, modulepath));
    }
    if (config.plugins.indexOf('plugins/markdown')<0) {
      config.plugins.push('plugins/markdown');
    }
    return config;
  }

  return JSDocCompileJob;
}

module.exports = createJSDocCompileJob;


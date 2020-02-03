function creator (execlib, fsjobslib) {
  'use strict';

  //for .allexns.json
  process.chdir(__dirname);

  var lib = execlib.lib,
    Destroyable = lib.Destroyable,
    qlib = lib.qlib,
    Node = require('allex_nodehelpersserverruntimelib')(lib),
    FsTraverser = require('allex_fstraversingserverruntimelib')(lib),
    fsutils = require('allex_fsutilsserverruntimelib')(lib),
    TutorialsCheckerMixin = require('./mixins/tutorialscheckercreator')(execlib, fsjobslib),
    JSDocFinderJob = require('./jobs/jsdocfindercreator')(execlib, FsTraverser, fsjobslib, fsutils),
    JSDocCompileJob = require('./jobs/jsdoccompilejobcreator')(execlib, fsjobslib, Node, TutorialsCheckerMixin),
    JSDocableDirWatcher  = require('./watchers')(execlib, fsjobslib, Node, fsutils, FsTraverser, JSDocCompileJob, TutorialsCheckerMixin);

  function ArrayOfDestroyables () {
    Destroyable.call(this);
    this.destroyables = [];
  }
  lib.inherit(ArrayOfDestroyables, Destroyable);
  ArrayOfDestroyables.prototype.__cleanUp = function () {
    if (this.destroyables) {
      lib.arryDestroyAll(this.destroyables);
    }
    this.destroyables = null;
    Destroyable.prototype.__cleanUp.call(this);
  };
  ArrayOfDestroyables.prototype.add = function (destroyable) {
    this.destroyables.push(destroyable);
    destroyable.destroyed.attachForSingleShot(this.remove.bind(this, destroyable));
  };
  ArrayOfDestroyables.prototype.remove = function (destroyable) {
    var ind;
    if (!lib.isArray(this.destroyables)) {
      return;
    }
    ind = this.destroyables.indexOf(destroyable);
    if (ind>=0) {
      this.destroyables.splice(ind,1);
    }
    if (this.destroyables.length<1) {
      this.destroy();
    }
  };

  function JSDocCompiler (outpath, webroot) {
    Node.Fs.ensureDirSync(fsutils.surePath(outpath));
    this.gittables = new lib.DIContainer();
    this.jobs = new qlib.JobCollection();
    this.recompiled = new lib.HookCollection();
    this.outpath = outpath;
    this.webroot = webroot || '/';
  }
  JSDocCompiler.prototype.destroy = function () {
    this.outpath = null;
    if (this.recompiled) {
      this.recompiled.destroy();
    }
    this.recompiled = null;
    if (this.jobs) {
      this.jobs.destroy();
    }
    this.jobs = null;
    if (this.gittables) {
      this.gittables.destroyDestroyables();
      this.gittables.destroy();
    }
    this.gittables = null;
  };
  JSDocCompiler.prototype.addNodeModulesPath = function (nodemodulespath) {
    var job = new JSDocFinderJob(nodemodulespath),
     ret = job.go();
    ret.then(
      this.recompiled.fire.bind(this.recompiled, '*'),
      null,
      this.onJSDocableDir.bind(this)
    );
    return ret;
  };
  JSDocCompiler.prototype.onJSDocableDir = function (obj) {
    console.log('JSDocable', obj);
    var p;
    if (!obj) {
      return;
    }
    if (!obj.path) {
      return;
    }
    /*
    p = this.jobs.run('.', new JSDocCompileJob(obj.path, fsutils.surePath(this.outpath), this.webroot));
    if (obj.gittable) {
      p.then(
        this.addGittable.bind(this, obj),
        console.error.bind(console, 'jsdoc compile nok')
      );
      return;
    }
    */
    if (obj.gittable) {
      this.addGittable(obj);
      return;
    }
    this.jobs.run('.', new JSDocCompileJob(obj.path, fsutils.surePath(this.outpath), this.webroot));
  };
  JSDocCompiler.prototype.addGittable = function (obj) {
    console.log('addGittable', obj);
    var name, watcher, watcherarry;
    if (!(obj && lib.isArray(obj.found))) {
      return;
    }
    name = obj.found[obj.found.length-1];
    watcher = new JSDocableDirWatcher(obj.path, fsutils.surePath(this.outpath), this.webroot);
    watcherarry = this.gittables.get(name);
    if (!watcherarry) {
      watcherarry = new ArrayOfDestroyables();
      this.gittables.registerDestroyable(name, watcherarry);
    }
    watcherarry.add(watcher);
  };

  return JSDocCompiler;
}

module.exports = creator;

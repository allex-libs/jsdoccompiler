function createJSDocFinderJob (execlib, FsTraverser, fsjobslib, fsutils) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    JobBase = qlib.JobBase,
    JSDocDirCheckerJob = require('./jsdocdircheckercreator')(execlib, fsjobslib);

  function MarkerJob (defer) {
    JobBase.call(this, defer);
  }
  lib.inherit(MarkerJob, JobBase);
  MarkerJob.prototype.go = function () {
    var ret = this.defer.promise;
    this.resolve(true);
    return ret;
  };

  function JSDocFinderJob (nodemodulespath, defer) {
    JobBase.call(this, defer);
    this.nodemodulespath = nodemodulespath;
    this.traverser = null;
    this.jobs = new qlib.JobCollection();
  }
  lib.inherit(JSDocFinderJob, JobBase);
  JSDocFinderJob.prototype.destroy = function () {
    if (this.jobs) {
      this.jobs.destroy();
    }
    this.jobs = null;
    if (this.traverser) {
      this.traverser.destroy();
    }
    this.traverser = null;
    this.nodemodulespath = null;
    JobBase.prototype.destroy.call(this);
  };
  JSDocFinderJob.prototype.go = function () {
    if (!this.defer) {
      return q(null);
    }
    if (!this.traverser) {
      this.traverser = new FsTraverser(this.nodemodulespath, 1, this.onDirFound.bind(this), 'dl');
      this.traverser.go().then(
        this.onTraversalDone.bind(this),
        this.reject.bind(this)
      );
    }
    return this.defer.promise;
  };
  JSDocFinderJob.prototype.onDirFound = function (found) {
    var path = fsutils.surePath(found);
    //console.log(path);
    //this.notify(path);
    this.jobs.run('.', new JSDocDirCheckerJob(path))
    .then(
      this.onJSDocDirChecked.bind(this, found, path)
      //this.notify.bind(this, {found: found, path: path})
    );
  };
  JSDocFinderJob.prototype.onJSDocDirChecked = function (found, path, gittable) {
    this.notify({found: found, path: path, gittable: gittable});
  };
  JSDocFinderJob.prototype.onTraversalDone = function () {
    qlib.promise2defer(this.jobs.run('.', new MarkerJob()), this);
  };


  return JSDocFinderJob;
}

module.exports = createJSDocFinderJob;

var jsdocconfigfilename = 'jsdocconfig.json';
function createJSDocDirCheckerJob (execlib, fsjobslib) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    JobBase = qlib.JobBase,
    FileMustExistJob = fsjobslib.FileMustExistJob,
    DirExistsJob = fsjobslib.DirExistsJob;

  function JSDocDirCheckerJob (dirpath, defer) {
    JobBase.call(this, defer);
    this.dirpath = dirpath;
  }
  lib.inherit(JSDocDirCheckerJob, JobBase);
  JSDocDirCheckerJob.prototype.destroy = function () {
    this.dirpath = null;
    JobBase.prototype.destroy.call(this);
  };
  JSDocDirCheckerJob.prototype.go = function () {
    this.mustExist('package.json').then(
      this.tryJsonJSDocConfig.bind(this),
      this.reject.bind(this)
    );
    return this.defer.promise;
  };
  JSDocDirCheckerJob.prototype.tryJsonJSDocConfig = function () {
    //console.log('ok, package.json found in', this.dirpath, 'jsdocconfig.json?');
    this.mustExist(jsdocconfigfilename).then(
      this.tryGitDir.bind(this),
      this.reject.bind(this)
    );
  };
  JSDocDirCheckerJob.prototype.tryGitDir = function () {
    qlib.promise2defer((new DirExistsJob([this.dirpath, '.git'])).go(), this);
  };
  JSDocDirCheckerJob.prototype.onGitDir = function (gitdirexists) {

  };
  JSDocDirCheckerJob.prototype.mustExist = function (filename) {
    return (new FileMustExistJob([this.dirpath, filename])).go();
  };


  return JSDocDirCheckerJob;
}

module.exports = createJSDocDirCheckerJob;

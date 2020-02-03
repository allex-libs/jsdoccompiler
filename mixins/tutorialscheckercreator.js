function createTutorialsCheckerMixin (execilb, fsjobslib) {
  'use strict';

  var lib = execlib.lib,
    DirExistsJob = fsjobslib.DirExistsJob;

  function TutorialsCheckerMixin () {
    this.tutorialspath = null;
  }
  TutorialsCheckerMixin.prototype.destroy = function () {
    this.tutorialspath = null;
  }
  TutorialsCheckerMixin.prototype.checkForTutorials = function (resolvecb, rejectcb, modulepath, configcontents) {
    var tutorialssubdir = (configcontents && configcontents.tutorials && configcontents.tutorials.path) ? configcontents.tutorials.path : 'tutorials',
      job = new DirExistsJob([modulepath, tutorialssubdir]),
      path = job.path;
    job.go().then(
      onTutorialsChecked.bind(null, this, resolvecb, path),
      rejectcb
    );
  };
  function onTutorialsChecked (tcm, resolvecb, path, found) {
    tcm.tutorialspath = found ? path : null;
    return resolvecb(found);
  }

  TutorialsCheckerMixin.addMethods = function (klass) {
    lib.inheritMethods(klass, TutorialsCheckerMixin
      ,'checkForTutorials'
    );
  };

  return TutorialsCheckerMixin;
}

module.exports = createTutorialsCheckerMixin;

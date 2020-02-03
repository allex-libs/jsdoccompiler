function createWatchersLib (execlib, fsjobslib, Node, fsutils, FsTraverser, JSDocCompileJob, TutorialsCheckerMixin) {
  'use strict';

  var EntityWatcher = require('./entitycreator')(execlib, Node, fsutils),
    FileWatcher = require('./filecreator')(execlib, EntityWatcher),
    DirWatcher = require('./dircreator')(execlib, EntityWatcher),
    JSDocableDirWatcher = require('./jsdocabledircreator')(execlib, EntityWatcher, FileWatcher, DirWatcher, JSDocCompileJob, TutorialsCheckerMixin, Node, fsjobslib);

  return JSDocableDirWatcher;
}

module.exports = createWatchersLib;

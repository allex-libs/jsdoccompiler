function createFileWatcher (execlib, EntityWatcher) {
  'use strict';

  var lib = execlib.lib;

  function FileWatcher (path) {
    EntityWatcher.call(this, path);
  }
  lib.inherit(FileWatcher, EntityWatcher);
  FileWatcher.prototype.checkForFs_change = function (filename) {
    this.changed.fire(true);
  };
  FileWatcher.prototype.checkForFs_rename = function (filename) {
    //this.destroy();
  };
  FileWatcher.prototype.eventTimeouts = {change: 2, rename: 0};

  return FileWatcher;
}

module.exports = createFileWatcher;

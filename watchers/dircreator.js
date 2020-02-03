function createDirWatcher (execlib, EntityWatcher) {
  'use strict';

  var lib = execlib.lib;

  function satisfiesFilterItem (filename, filter) {
    if (lib.isString(filter)) {
      return filename===filter;
    }
    if (filter instanceof RegExp) {
      //console.log(filter, 'test', filename, '? =>', filter.test(filename));
      return filter.test(filename);
    }
  }

  function satisfiesFilter (filename, filter) {
    if (!lib.isVal(filter)) {
      return true;
    }
    if (lib.isArray(filter)) {
      return filter.some(satisfiesFilterItem.bind(null, filename));
    }
    return satisfiesFilterItem(filename, filter);
    return true;
  }
  
  function DirWatcher (path, filter) {
    EntityWatcher.call(this, path);
    this.filter = filter;
  }
  lib.inherit(DirWatcher, EntityWatcher);
  DirWatcher.prototype.__cleanUp = function () {
    this.filter = null;
    EntityWatcher.prototype.__cleanUp.call(this);
  };
  DirWatcher.prototype.checkForFs_change = function (filename) {
    if (!satisfiesFilter(filename, this.filter)) {
      //console.log(filename, 'filtered out in change');
      return;
    }
    this.changed.fire(this, filename);
  };
  DirWatcher.prototype.checkForFs_rename = function (filename) {
    if (!satisfiesFilter(filename, this.filter)) {
      //console.log(filename, 'filtered out in rename');
      return;
    }
    this.changed.fire(this, filename);
  };
  DirWatcher.prototype.eventTimeouts = {change:2, rename:0};

  return DirWatcher;
}

module.exports = createDirWatcher;

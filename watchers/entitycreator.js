var _methodPrefix = 'checkForFs_';
function createEntityWatcher (execlib, Node, fsutils) {
  'use strict';

  var lib = execlib.lib,
    Destroyable = lib.Destroyable;

  function TimeoutHandler (cb, to) {
    this.timeout = null;
    if (cb) {
      this.setTimeout(cb, to||0);
    }
  }
  TimeoutHandler.prototype.destroy = function () {
    this.clearTimeout();
  };
  TimeoutHandler.prototype.clearTimeout = function () {
    if (this.timeout) {
      lib.clearTimeout(this.timeout);
    }
    this.timeout = null;
  };
  TimeoutHandler.prototype.setTimeout = function (cb, to) {
    this.clearTimeout();
    this.timeout = lib.runNext(cb, to);
  };

  function EntityWatcher (path) {
    Destroyable.call(this);
    this.path = fsutils.surePath(path);
    this.waiters = new lib.Map();
    this.fswatcher = null;
    this.changed = new lib.HookCollection();
    this.startListening();
  }
  lib.inherit (EntityWatcher, Destroyable);
  EntityWatcher.prototype.__cleanUp = function () {
    //console.log(this.constructor.name, this.path, 'dying');
    if (this.changed) {
      this.changed.destroy();
    }
    this.changed = null;
    if (this.fswatcher) {
      this.fswatcher.close();
    }
    this.fswatcher = null;
    if (this.waiters) {
      lib.containerDestroyAll(this.waiters);
      this.waiters.destroy();
    }
    this.waiters = null;
    this.path = null;
  };
  EntityWatcher.prototype.startListening = function () {
    if (this.fswatcher) {
      this.fswatcher.close();
    }
    //console.log(this.constructor.name, this.path, 'about to listen');
    try {
      this.fswatcher = Node.Fs.watch(this.path, this.onFsChanged.bind(this));
    }
    catch (e) {
      this.destroy(e);
    }
    //console.log(this.constructor.name, this.path, 'now listening');
  };
  EntityWatcher.prototype.onFsChanged = function (eventtype, filename) {
    if (eventtype === 'rename' && filename === Node.Path.basename(this.path)) {
      //console.log(this.constructor.name, 'should maybe kill self?');
      if (!fsutils.fileType(this.path)) {
        //console.log(this.constructor.name, 'oooh, yess...');
        this.startTheSelfDistructSequence();
        return;
      }
    }
    this.handleEventType(eventtype, filename);
  };
  EntityWatcher.prototype.handleEventType = function (eventtype, filename) {
    var evnttimeout, waiter;
    evnttimeout = this.eventTimeouts[eventtype];
    //console.log(this.constructor.name, this.path, 'handling', eventtype, filename, '=> event timeout', evnttimeout);
    if (!lib.isNumber(evnttimeout)) {
      return;
    }
    if (!evnttimeout) {
      this[_methodPrefix+eventtype](filename);
      return;
    }
    waiter = this.waiters.get(filename);
    if (!waiter) {
      //console.log(this.constructor.name, this.path, 'eventtype', eventtype, 'timeout', evnttimeout);
      this.waiters.add(filename, new TimeoutHandler(this[_methodPrefix+eventtype].bind(this,filename), evnttimeout));
      return;
    }
    //console.log(this.constructor.name, this.path, 'on Exisiting eventtype', eventtype, 'timeout', evnttimeout);
    waiter.setTimeout(this[_methodPrefix+eventtype].bind(this,filename), evnttimeout);
  };
  EntityWatcher.prototype.startTheSelfDistructSequence = function () {
    var selfdisttimeout = this.eventTimeouts.selfdestruct || 0;
    if (!selfdisttimeout) {
      this.destroy();
      return;
    }
    lib.runNext(this.checkForSelfDestruct.bind(this), selfdisttimeout);
  };
  EntityWatcher.prototype.checkForSelfDestruct = function () {
    //console.log(this.constructor.name, this.path, 'oce li ovaj checkForFs_delete?');
    try {
      //if (!fsutils.fileType(fsutils.pathForFilename(this.path, filename))) {
      if (!fsutils.fileType(this.path)) {
        //console.log(this.constructor.name, this.path, 'will destroy self');
        this.destroy();
        return;
      }
      //however, perhaps I was being rm-ed, but my child of the same name was also being rm-ed
    } catch (ignore) {
      this.destroy();
      return;
    }
    //console.log(this.constructor.name, this.path, 'will start listening, but rename first');
    this.handleEventType('change', Node.Path.basename(this.path));
    this.startListening();
  };
  EntityWatcher.prototype.eventTimeouts = {};

  return EntityWatcher;
}

module.exports = createEntityWatcher;

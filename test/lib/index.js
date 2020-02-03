function ensureDir (dirpath) {
  return (new allex_filesystemjobslib.EnsureDirJob(dirpath)).go();
}

function writeToFile (filepath) {
  return (new allex_filesystemjobslib.WriteToFileJob('blah', filepath)).go();
}

function removeFile (filepath) {
  return (new allex_filesystemjobslib.RmFileJob(filepath)).go();
}

function waitForChange (watcher) {
  var d = q.defer();
  watcher.changed.attachForSingleShot(d.resolve.bind(d), d.reject.bind(d));
  return d.promise;
}

function waitForNoChange (watcher) {
  var d = q.defer();
  watcher.changed.attachForSingleShot(d.reject.bind(d, new lib.Error('WATCHER_SHOULD_NOT_HAVE_CHANGED', 'The watcher '+watcher.constructor.name+' should not have changed')), d.reject.bind(d));
  lib.runNext(d.resolve.bind(d, true), 1*lib.intervals.Second);
  return d.promise;
}

function waitForDestruction (watcher) {
  var d = q.defer();
  watcher.destroyed.attachForSingleShot(d.resolve.bind(d), d.reject.bind(d));
  return d.promise;
}

function waitForNoDestruction (watcher) {
  var d = q.defer();
  watcher.destroyed.attachForSingleShot(d.reject.bind(d, new lib.Error('WATCHER_SHOULD_NOT_HAVE_DIED', 'The watcher '+watcher.constructor.name+' should not have got destructed')), d.reject.bind(d));
  lib.runNext(d.resolve.bind(d, true), 1*lib.intervals.Second);
  return d.promise;
}

function writeAndWaitForChange (filepathtowriteto, watcher) {
  var ret = waitForChange(watcher);
  writeToFile(filepathtowriteto);
  return ret;
}

function writeAndWaitForNoChange (filepathtowriteto, watcher) {
  var ret = waitForNoChange(watcher);
  writeToFile(filepathtowriteto);
  return ret;
}

module.exports = {
  ensureDir: ensureDir,
  writeToFile: writeToFile,
  removeFile: removeFile,
  writeToFile: writeToFile,
  removeFile: removeFile,
  waitForChange: waitForChange,
  waitForNoChange: waitForNoChange,
  waitForDestruction: waitForDestruction,
  waitForNoDestruction: waitForNoDestruction,
  writeAndWaitForChange: writeAndWaitForChange,
  writeAndWaitForNoChange: writeAndWaitForNoChange
};

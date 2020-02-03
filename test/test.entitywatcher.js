var Node = require('allex_nodehelpersserverruntimelib')(lib),
  Fs = Node.Fs,
  Path = Node.Path,
  testlib = require('./lib');

describe('Entity Watcher', function () {
  loadClientSide(['allex:filesystemjobs:lib']);
  it('Load EntityWatcher class', function () {
    return setGlobal('EntityWatcher', require('../watchers/entitycreator')(
      execlib,
      Node,
      require('allex_fsutilsserverruntimelib')(lib)
    ));
  });
  it('Load FileWatcher class', function () {
    return setGlobal('FileWatcher', require('../watchers/filecreator')(
      execlib,
      EntityWatcher
    ));
  });
  it('Load DirWatcher class', function () {
    return setGlobal('DirWatcher', require('../watchers/dircreator')(
      execlib,
      EntityWatcher
    ));
  });
	it('Create the testdir', function () {
    return testlib.ensureDir([__dirname, 'testdir']);
	});
  it('Create a DirWatcher', function () {
    return setGlobal('dirwatcher', new DirWatcher([__dirname, 'testdir']));
  });
  it('Write to file', function () {
    return testlib.writeAndWaitForChange([__dirname, 'testdir', 'testfile.txt'], dirwatcher);
  });
  it('Remove file', function () {
    return testlib.removeFile([__dirname, 'testdir', 'testfile.txt']);
  });
  it('Destroy dirwatcher', function () {
    dirwatcher.destroy();
  });
  it('Create a filtered DirWatcher', function () {
    return setGlobal('dirwatcher', new DirWatcher([__dirname, 'testdir'], /^2test/));
  });
  it('Write to file', function () {
    return testlib.writeAndWaitForNoChange([__dirname, 'testdir', 'testfile.txt'], dirwatcher);
  });
  it('Remove file', function () {
    return testlib.removeFile([__dirname, 'testdir', 'testfile.txt']);
  });
  it('Destroy dirwatcher', function () {
    dirwatcher.destroy();
  });
  it('Write to file', function () {
    return testlib.writeToFile([__dirname, 'testdir', 'testfile.txt']);
  });
  it('Create a FileWatcher', function () {
    return setGlobal('filewatcher', new FileWatcher([__dirname, 'testdir']));
  });
  it('Write to file', function () {
    return testlib.writeAndWaitForChange([__dirname, 'testdir', 'testfile.txt'], filewatcher);
  });
  it('Remove file', function () {
    return testlib.removeFile([__dirname, 'testdir', 'testfile.txt']);
  });
  it('Destroy filewatcher', function () {
    filewatcher.destroy();
  });
  it('Create a DirWatcher', function () {
    return setGlobal('dirwatcher', new DirWatcher([__dirname, 'testdir']));
  });
	it('Create the testtestdir', function () {
    return testlib.ensureDir([__dirname, 'testdir', 'testdir']);
	});
  it('Remove the testtestdir, dirwatcher must not die', function () {
    var ret = testlib.waitForNoDestruction(dirwatcher);
    (new allex_filesystemjobslib.RmDirJob([__dirname, 'testdir', 'testdir'])).go();
    return ret;
  });
  it('Remove the testdir, dirwatcher must die', function () {
    var ret = testlib.waitForDestruction(dirwatcher);
    (new allex_filesystemjobslib.RmDirJob([__dirname, 'testdir'])).go();
    return ret;
  });
  it('Destroy dirwatcher', function () {
    dirwatcher.destroy();
  });
});

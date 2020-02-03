

describe ('Basic Test', function () {
  it('Load the Lib', function () {
    return setGlobal('CompilerKlass', require('..')(execlib));
  });
  it('Create a Compiler', function () {
    //return setGlobal('Compiler', new CompilerKlass([__dirname, 'jsdocoutput']));
    return setGlobal('Compiler', new CompilerKlass(['/', 'home', 'test', 'allexjs', '.webapps', 'doc'], '/doc'));
  });
  it('Add a nodemodules path', function () {
    return Compiler.addNodeModulesPath(require('path').join(__dirname, '..', '..', '..', 'node_modules'));
  });
  it('Add a nodemodules path', function () {
    return Compiler.addNodeModulesPath(require('path').join(__dirname, '..', '..', '..', 'node_modules', 'allex', 'node_modules'));
  });
  it('Wait forever', function () {
    this.timeout(1e42);
    return q.defer().promise;
  });
});

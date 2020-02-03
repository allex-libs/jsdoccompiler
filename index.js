function createLib (execlib) {
  return execlib.loadDependencies('client', ['allex:filesystemjobs:lib'], require('./libindex').bind(null, execlib));
}

module.exports = createLib;

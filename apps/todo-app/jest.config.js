module.exports = {
  name: 'todo-app',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/todo-app',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};

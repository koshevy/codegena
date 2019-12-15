module.exports = {
  name: 'todo-app-scheme',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/todo-app-scheme',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};

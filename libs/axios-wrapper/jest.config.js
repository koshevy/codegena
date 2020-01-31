module.exports = {
  name: 'axios-wrapper',
  preset: '../../jest.config.js',
  silent: false,
  coverageDirectory: '../../coverage/libs/axios-wrapper',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};

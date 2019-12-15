module.exports = {
  name: 'oapi3ts-cli',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/oapi3ts-cli',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};

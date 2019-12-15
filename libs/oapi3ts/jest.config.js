module.exports = {
  name: 'oapi3ts',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/oapi3ts',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};

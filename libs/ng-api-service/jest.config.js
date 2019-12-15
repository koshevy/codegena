module.exports = {
  name: 'ng-api-service',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/ng-api-service',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};

const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  ...(process.env['JEST_HTML_REPORTER_OUTPUT_PATH'] && {
    reporters: [
      'default',
      ['jest-html-reporter', { append: true, pageTitle: 'Codegena Jest tests' }],
    ],
  }),
};

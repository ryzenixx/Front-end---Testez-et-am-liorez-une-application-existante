const { rmSync } = require('node:fs');
const { defineConfig } = require('cypress');
const nyc = require('./.nycrc.json');

module.exports = defineConfig({
  screenshotsFolder: 'dist/e2e/screenshots',
  videosFolder: 'dist/e2e/videos',
  expose: {
    codeCoverage: {
      checkCoverage: true,
      expectFrontendCoverageOnly: true,
    },
  },
  e2e: {
    baseUrl: 'http://127.0.0.1:4300',
    setupNodeEvents(on, config) {
      rmSync(nyc['temp-dir'], { recursive: true, force: true });
      rmSync(nyc['report-dir'], { recursive: true, force: true });
      return require('@cypress/code-coverage/task')(on, config);
    },
  },
});

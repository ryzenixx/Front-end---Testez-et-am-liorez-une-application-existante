
module.exports = {
  preset: 'jest-preset-angular',
  roots: ['<rootDir>/src/'],
  testMatch: ['**/+(*.)+(spec).+(ts|js)'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/*.d.ts'],
  coverageReporters: ['html', 'text', 'json-summary'],
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
};

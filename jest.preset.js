const nxPreset = require('@nx/jest/preset').default;

/** @type {import('jest').Config} */
module.exports = {
  ...nxPreset,
  passWithNoTests: true,
  testTimeout: 20000,
  setupFilesAfterEnv: ['jest-extended/all'],
};

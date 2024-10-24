import type { Config } from 'jest';

export default {
  displayName: 'service-order',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  testMatch: ['**/*.int-spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/service-order',
  globalSetup: './jest.int.setup.ts',
  globalTeardown: './jest.int.teardown.ts',
  maxWorkers: 1, // Equivalent of "runInBand" option
} satisfies Config;

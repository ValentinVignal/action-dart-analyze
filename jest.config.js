// eslint-disable-next-line no-undef
module.exports = {
  clearMocks: true,
  restoreMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  verbose: true,
  coverageDirectory: 'coverage',
  collectCoverage: true,
};

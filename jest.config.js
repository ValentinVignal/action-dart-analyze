// eslint-disable-next-line no-undef
exports.default = {
  clearMocks: true,
  restoreMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: true,
  coverageDirectory: 'coverage',
  collectCoverage: true,
};

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/test/setup.tsx'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@keyhole/(.*)$': '<rootDir>/src/lib/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
};

module.exports = createJestConfig(customJestConfig);

/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        esModuleInterop: true,
        paths: {
          "@core/*": ["<rootDir>/src/core/*"],
          "@script/*": ["<rootDir>/src/script/*"],
          "@media/*": ["<rootDir>/src/media/*"],
          "@video/*": ["<rootDir>/src/video/*"],
          "@audio/*": ["<rootDir>/src/audio/*"],
          "@text/*": ["<rootDir>/src/text/*"],
          "@cli/*": ["<rootDir>/src/cli/*"],
          "@utils/*": ["<rootDir>/src/utils/*"],
          "@config/*": ["<rootDir>/config/*"],
          "@templates/*": ["<rootDir>/templates/*"]
        }
      }
    }]
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/__tests__/**',
    '!src/**/index.ts'
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@script/(.*)$': '<rootDir>/src/script/$1',
    '^@media/(.*)$': '<rootDir>/src/media/$1',
    '^@video/(.*)$': '<rootDir>/src/video/$1',
    '^@audio/(.*)$': '<rootDir>/src/audio/$1',
    '^@text/(.*)$': '<rootDir>/src/text/$1',
    '^@cli/(.*)$': '<rootDir>/src/cli/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@templates/(.*)$': '<rootDir>/templates/$1'
  },
  verbose: true
};
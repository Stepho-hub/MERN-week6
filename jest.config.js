export default {
  projects: [
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/**/*.test.js', '<rootDir>/src/**/*.test.jsx'],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
      transform: {
        '^.+\\.jsx?$': 'babel-jest',
      },
      moduleFileExtensions: ['js', 'jsx'],
      moduleNameMapper: {
        '\\.(css|scss|sass)$': 'identity-obj-proxy',
        '\\.(svg|png|jpg|jpeg|gif)$': '<rootDir>/src/__mocks__/fileMock.js',
      },
    },
    {
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/server/**/*.test.js'],
      transform: {
        '^.+\\.js$': 'babel-jest',
      },
      moduleFileExtensions: ['js'],
    },
  ],
};
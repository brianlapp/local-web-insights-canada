module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock Lighthouse to avoid ESM issues
    '^lighthouse$': '<rootDir>/__mocks__/lighthouse.ts' 
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest']
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Ensure mocks are properly resolved
  moduleDirectories: ['node_modules', '<rootDir>'],
  // Tell Jest to transform lighthouse even though it's in node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(lighthouse)/)'
  ]
}; 
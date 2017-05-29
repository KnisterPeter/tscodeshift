module.exports = function(wallaby) {
  return {
    files: [
      'src/**/*.ts',
      '!src/**/*.test.ts',
      'tsconfig.json'
    ],
    tests: [
      'src/**/*.test.ts'
    ],
    env: {
      type: 'node'
    },
    testFramework: 'jest',
    setup: function(wallaby) {
      const jest = require('./package.json').jest;
      delete jest.transform;
      wallaby.testFramework.configure(jest);
    },
    debug: false
  };
}

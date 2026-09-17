/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  coverageDirectory: "tests/coverage",
};

module.exports = config;

{
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
  "moduleNameMapping": {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  "transform": {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { "presets": ["next/babel"] }]
  },
  "moduleFileExtensions": ["js", "jsx", "ts", "tsx", "json"],
  "testPathIgnorePatterns": [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/"
  ],
  "collectCoverageFrom": [
    "src/**/*.{js,jsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx}"
  ],
  "coverageReporters": ["text", "lcov", "html"]
}
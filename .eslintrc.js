/* @flow */

// eslint-disable-next-line import/no-commonjs
module.exports = {
  extends: ["@krakenjs/eslint-config-grumbler/eslintrc-browser", "prettier"],

  rules: {
    "react/display-name": "off",
    "prefer-regex-literals": "off",
    "require-atomic-updates": "off",
    "max-lines": "off",
    "react/require-default-props": "off",
    "react/prop-types": "off",
  },

  globals: {
    __SMART_BUTTONS__: true,
    paypal: true,
    $Shape: true,
    afterAll: true,
    jest: true,
  },
  overrides: [
    {
      files: ["**/*.test.js"],
      env: {
        jest: true,
      },
      globals: {
        JestMockFn: false,
      },
    },
  ],
  ignorePatterns: ["node-qrcode.js"],
};

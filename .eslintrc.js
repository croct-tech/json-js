// Workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
    extends: ['plugin:@croct/typescript'],
    plugins: ['@croct'],
    parserOptions: {
        project: ['./tsconfig.json'],
    },
    rules: {
        // Disable jest rules since this project doesn't need any runtime test
        'jest/no-deprecated-functions': 'off',
    },
};

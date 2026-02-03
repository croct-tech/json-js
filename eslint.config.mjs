import { defineConfig } from 'eslint/config';
import { configs } from '@croct/eslint-plugin';

export default defineConfig(
    configs.typescript,
    {
        rules: {
            // Disable jest rules since this project doesn't need any runtime test
            'jest/no-deprecated-functions': 'off',
            '@typescript-eslint/no-redundant-type-constituents': 'off',
        },
    }
);
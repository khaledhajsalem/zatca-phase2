module.exports = {
    env: {
        node: true,
        es6: true,
        mocha: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
    },
    rules: {
        'indent': ['error', 2],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'no-console': 'off',
        'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
        'no-constant-condition': ['error', { 'checkLoops': false }]
    }
};
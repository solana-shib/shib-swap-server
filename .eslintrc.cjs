module.exports = {
  extends: ['@inc-dev'],
  parserOptions: {
    project: require.resolve('./tsconfig.json'),
  },
  rules: {
    // Fixed in @inc-dev/eslint-config@1.1.6
    // https://github.com/eslint/eslint/issues/11162
    curly: ['error', 'all'],
  },
  globals: {
    logger: true,
    dbClient: true,
    rpcConnection: true,
  },
}

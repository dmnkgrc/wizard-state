module.exports = {
  plugins: [require('@trivago/prettier-plugin-sort-imports')],
  printWidth: 80,
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  importOrder: ['^@core/(.*)$', '^@server/(.*)$', '^@ui/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

module.exports = {
  plugins: [require('@trivago/prettier-plugin-sort-imports')],
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  importOrder: ['^@core/(.*)$', '^@server/(.*)$', '^@ui/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

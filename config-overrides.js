const {
  override,
  fixBabelImports,
  addDecoratorsLegacy,
} = require('customize-cra');

module.exports = override(
  fixBabelImports('antd', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: 'css',
  }),
  addDecoratorsLegacy(),
);

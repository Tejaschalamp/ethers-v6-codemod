/**
 * ethers-v5-to-v6 Main Workflow
 * Applies all 9 transforms to migrate ethers.js v5 code to v6
 */

module.exports = function(fileInfo, api) {
  const transforms = [
    require('./transforms/remove-utils'),
    require('./transforms/remove-providers'),
    require('./transforms/rename-web3provider'),
    require('./transforms/bignumber-to-bigint'),
    require('./transforms/rename-constants'),
    require('./transforms/rename-contract-methods'),
    require('./transforms/rename-solidity-functions'),
    require('./transforms/fix-imports'),
    require('./transforms/rename-misc'),
  ];

  let source = fileInfo.source;

  for (const transform of transforms) {
    const result = transform({ source }, api);
    if (result) {
      source = result;
    }
  }

  return source;
};

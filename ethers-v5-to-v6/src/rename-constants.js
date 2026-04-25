/**
 * TRANSFORM 5: ethers.constants.X → v6 equivalents
 *
 * BEFORE (v5):
 *   ethers.constants.AddressZero   → ethers.ZeroAddress
 *   ethers.constants.HashZero      → ethers.ZeroHash
 *   ethers.constants.MaxUint256    → ethers.MaxUint256
 *   ethers.constants.Zero          → 0n
 *   ethers.constants.One           → 1n
 *   ethers.constants.Two           → 2n
 *   ethers.constants.WeiPerEther   → ethers.WeiPerEther
 *   ethers.constants.MaxInt256     → ethers.MaxInt256
 *   ethers.constants.MinInt256     → ethers.MinInt256
 *   ethers.constants.NegativeOne   → -1n
 */

const CONSTANTS_MAP = {
  AddressZero: { type: 'member', value: 'ZeroAddress' },
  HashZero: { type: 'member', value: 'ZeroHash' },
  MaxUint256: { type: 'member', value: 'MaxUint256' },
  MaxInt256: { type: 'member', value: 'MaxInt256' },
  MinInt256: { type: 'member', value: 'MinInt256' },
  WeiPerEther: { type: 'member', value: 'WeiPerEther' },
  EtherSymbol: { type: 'member', value: 'EtherSymbol' },
  Zero: { type: 'bigint', value: '0n' },
  One: { type: 'bigint', value: '1n' },
  Two: { type: 'bigint', value: '2n' },
  NegativeOne: { type: 'bigint', value: '-1n' },
};

module.exports = function (fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let hasChanges = false;

  // Handle: ethers.constants.X
  root
    .find(j.MemberExpression, {
      object: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'ethers' },
        property: { type: 'Identifier', name: 'constants' },
      },
    })
    .forEach((path) => {
      const constName = path.node.property.name;
      const mapping = CONSTANTS_MAP[constName];
      if (!mapping) return;

      if (mapping.type === 'member') {
        // ethers.constants.AddressZero → ethers.ZeroAddress
        j(path).replaceWith(
          j.memberExpression(
            j.identifier('ethers'),
            j.identifier(mapping.value)
          )
        );
      } else {
        // ethers.constants.Zero → 0n (BigInt literal)
        j(path).replaceWith(
          j.bigIntLiteral(mapping.value.replace('n', ''))
        );
      }
      hasChanges = true;
    });

  // Handle standalone: constants.AddressZero (when constants is imported directly)
  root
    .find(j.MemberExpression, {
      object: { type: 'Identifier', name: 'constants' },
    })
    .forEach((path) => {
      const constName = path.node.property.name;
      const mapping = CONSTANTS_MAP[constName];
      if (!mapping) return;

      if (mapping.type === 'member') {
        j(path).replaceWith(j.identifier(mapping.value));
      } else {
        j(path).replaceWith(
          j.bigIntLiteral(mapping.value.replace('n', ''))
        );
      }
      hasChanges = true;
    });

  return hasChanges ? root.toSource({ quote: 'single' }) : null;
};

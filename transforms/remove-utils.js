/**
 * TRANSFORM 1: Remove ethers.utils namespace
 *
 * BEFORE (v5):  ethers.utils.parseEther("1.0")
 * AFTER  (v6):  ethers.parseEther("1.0")
 *
 * Also handles:
 *   ethers.utils.formatEther  → ethers.formatEther
 *   ethers.utils.keccak256    → ethers.keccak256
 *   ethers.utils.id           → ethers.id
 *   ... and ALL other ethers.utils.X patterns
 */

module.exports = function (fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let hasChanges = false;

  // Find: ethers.utils.ANYTHING
  root
    .find(j.MemberExpression, {
      object: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'ethers' },
        property: { type: 'Identifier', name: 'utils' },
      },
    })
    .forEach((path) => {
      // Replace with: ethers.ANYTHING (skip the middle "utils")
      j(path).replaceWith(
        j.memberExpression(
          j.identifier('ethers'),
          path.node.property
        )
      );
      hasChanges = true;
    });

  // Return null if no changes (jscodeshift skips the file)
  return hasChanges ? root.toSource({ quote: 'single' }) : null;
};

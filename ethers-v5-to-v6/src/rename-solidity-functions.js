/**
 * TRANSFORM 7: Solidity hashing function renames
 *
 * BEFORE (v5):
 *   ethers.utils.solidityKeccak256(types, values)  → ethers.solidityPackedKeccak256(types, values)
 *   ethers.utils.soliditySha256(types, values)     → ethers.solidityPackedSha256(types, values)
 *   ethers.utils.solidityPack(types, values)       → ethers.solidityPacked(types, values)
 *
 * Also handles standalone imports:
 *   solidityKeccak256(...) → solidityPackedKeccak256(...)
 *   soliditySha256(...)    → solidityPackedSha256(...)
 *   solidityPack(...)      → solidityPacked(...)
 */

const RENAME_MAP = {
  solidityKeccak256: 'solidityPackedKeccak256',
  soliditySha256: 'solidityPackedSha256',
  solidityPack: 'solidityPacked',
};

module.exports = function (fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let hasChanges = false;

  // Rename standalone identifiers (after utils has been removed by remove-utils transform)
  // e.g. solidityKeccak256 → solidityPackedKeccak256
  root
    .find(j.Identifier)
    .forEach((path) => {
      const newName = RENAME_MAP[path.node.name];
      if (!newName) return;

      // Make sure it's not a property definition (object key)
      if (
        path.parent.node.type === 'Property' &&
        path.parent.node.key === path.node
      ) return;

      path.node.name = newName;
      hasChanges = true;
    });

  // Update named imports: import { solidityKeccak256 } from 'ethers'
  root
    .find(j.ImportSpecifier)
    .forEach((path) => {
      const newName = RENAME_MAP[path.node.imported.name];
      if (!newName) return;

      path.node.imported.name = newName;
      if (path.node.local.name === path.node.imported.name || RENAME_MAP[path.node.local.name]) {
        path.node.local.name = newName;
      }
      hasChanges = true;
    });

  return hasChanges ? root.toSource({ quote: 'single' }) : null;
};

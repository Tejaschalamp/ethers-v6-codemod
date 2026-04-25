/**
 * TRANSFORM 2: Remove ethers.providers namespace
 *
 * BEFORE (v5):  new ethers.providers.JsonRpcProvider(url)
 * AFTER  (v6):  new ethers.JsonRpcProvider(url)
 *
 * Also handles:
 *   ethers.providers.WebSocketProvider  → ethers.WebSocketProvider
 *   ethers.providers.IpcProvider        → ethers.IpcProvider
 *   ... and ALL other ethers.providers.X patterns
 */

module.exports = function (fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let hasChanges = false;

  // Find: ethers.providers.ANYTHING
  root
    .find(j.MemberExpression, {
      object: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'ethers' },
        property: { type: 'Identifier', name: 'providers' },
      },
    })
    .forEach((path) => {
      // Replace with: ethers.ANYTHING (skip the middle "providers")
      j(path).replaceWith(
        j.memberExpression(
          j.identifier('ethers'),
          path.node.property
        )
      );
      hasChanges = true;
    });

  return hasChanges ? root.toSource({ quote: 'single' }) : null;
};

/**
 * TRANSFORM 8: Miscellaneous renames
 *
 * HDNode → HDNodeWallet
 *   ethers.utils.HDNode  → ethers.HDNodeWallet
 *   HDNode.fromMnemonic  → HDNodeWallet.fromPhrase
 *
 * getGasPrice() → getFeeData() (adds TODO — return type changed)
 *
 * provider.sendTransaction() → provider.broadcastTransaction()
 *   NOTE: Only renames on provider objects — signer.sendTransaction is unchanged.
 *   Adds a TODO comment so devs verify which one they're using.
 */

module.exports = function (fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let hasChanges = false;

  // ── HDNode → HDNodeWallet ──────────────────────────────────────────────────
  root
    .find(j.Identifier, { name: 'HDNode' })
    .forEach((path) => {
      // Skip if it's a property key (e.g. { HDNode: ... })
      if (
        path.parent.node.type === 'Property' &&
        path.parent.node.key === path.node &&
        !path.parent.node.computed
      ) return;

      path.node.name = 'HDNodeWallet';
      hasChanges = true;
    });

  // HDNode.fromMnemonic → HDNodeWallet.fromPhrase
  root
    .find(j.MemberExpression, {
      property: { name: 'fromMnemonic' },
    })
    .forEach((path) => {
      path.node.property.name = 'fromPhrase';
      hasChanges = true;
    });

  // ── getGasPrice() → getFeeData() ───────────────────────────────────────────
  // Return type changed from BigNumber to FeeData object — add TODO
  root
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        property: { name: 'getGasPrice' },
      },
    })
    .forEach((path) => {
      path.node.callee.property.name = 'getFeeData';
      // Add TODO comment — return value is now FeeData object, not BigNumber
      const comment = j.line(
        ' TODO(ethers-codemod): getFeeData() returns FeeData object. Use .gasPrice for legacy or .maxFeePerGas for EIP-1559'
      );
      path.node.comments = path.node.comments || [];
      path.node.comments.unshift(comment);
      hasChanges = true;
    });

  // ── provider.sendTransaction → provider.broadcastTransaction ───────────────
  // Only on provider — signer.sendTransaction is unchanged
  // We flag with TODO since we can't statically know if it's a provider or signer
  root
    .find(j.MemberExpression, {
      property: { name: 'sendTransaction' },
    })
    .forEach((path) => {
      // Add a TODO instead of blindly renaming — signer.sendTransaction still valid
      const comment = j.line(
        ' TODO(ethers-codemod): if this is a Provider, rename to broadcastTransaction(). Signer.sendTransaction is unchanged.'
      );
      const parent = path.parent.node;
      parent.comments = parent.comments || [];
      // Only add if not already added
      if (!parent.comments.some(c => c.value && c.value.includes('broadcastTransaction'))) {
        parent.comments.unshift(comment);
        hasChanges = true;
      }
    });

  return hasChanges ? root.toSource({ quote: 'single' }) : null;
};

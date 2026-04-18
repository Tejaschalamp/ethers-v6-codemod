/**
 * TRANSFORM 4: BigNumber.from(x) → BigInt(x)
 *
 * BEFORE (v5):  BigNumber.from("1000")
 *               BigNumber.from(someVar)
 *
 * AFTER  (v6):  BigInt("1000")
 *               BigInt(someVar)
 *
 * NOTE: Cases where BigNumber methods like .add() / .mul() are chained
 * are left with a TODO comment for manual/AI review, to avoid false positives.
 */

module.exports = function (fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let hasChanges = false;

  // Find: BigNumber.from(...)
  root
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'BigNumber' },
        property: { type: 'Identifier', name: 'from' },
      },
    })
    .forEach((path) => {
      const args = path.node.arguments;

      // Check if the parent uses BigNumber-specific methods (.add, .mul, etc.)
      // If so, add a TODO comment instead of blindly transforming
      const parent = path.parent.node;
      const bigNumberMethods = ['add', 'sub', 'mul', 'div', 'mod', 'pow', 'eq', 'lt', 'lte', 'gt', 'gte', 'toNumber', 'toHexString', 'toBigInt'];

      const isChained =
        parent.type === 'MemberExpression' &&
        bigNumberMethods.includes(parent.property && parent.property.name);

      if (isChained) {
        // Add a TODO comment — leave for AI/manual review
        const comment = j.line(
          ' TODO(ethers-codemod): verify this BigNumber chain and migrate manually'
        );
        path.node.comments = path.node.comments || [];
        path.node.comments.unshift(comment);
        hasChanges = true;
        return;
      }

      // Safe to transform: BigNumber.from(x) → BigInt(x)
      j(path).replaceWith(
        j.callExpression(j.identifier('BigInt'), args)
      );
      hasChanges = true;
    });

  return hasChanges ? root.toSource({ quote: 'single' }) : null;
};

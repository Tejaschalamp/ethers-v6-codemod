/**
 * TRANSFORM 6: Contract method bucket renames
 *
 * In v5, less-common operations were behind "buckets":
 *   contract.callStatic.foo(args)          → contract.foo.staticCall(args)
 *   contract.estimateGas.foo(args)         → contract.foo.estimateGas(args)
 *   contract.populateTransaction.foo(args) → contract.foo.populateTransaction(args)
 *   contract.functions.foo(args)           → contract.foo(args)  [direct call]
 */

module.exports = function (fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let hasChanges = false;

  // Match: X.callStatic.method(args) → X.method.staticCall(args)
  // Match: X.estimateGas.method(args) → X.method.estimateGas(args)
  // Match: X.populateTransaction.method(args) → X.method.populateTransaction(args)

  const BUCKET_MAP = {
    callStatic: 'staticCall',
    estimateGas: 'estimateGas',
    populateTransaction: 'populateTransaction',
  };

  root
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
        },
      },
    })
    .forEach((path) => {
      const callee = path.node.callee; // X.bucket.method
      const bucketExpr = callee.object; // X.bucket
      const methodName = callee.property; // method

      if (bucketExpr.type !== 'MemberExpression') return;

      const bucketName = bucketExpr.property && bucketExpr.property.name;
      const newSuffix = BUCKET_MAP[bucketName];
      if (!newSuffix) return;

      const contractExpr = bucketExpr.object; // X (the contract)

      // Build: X.method.newSuffix(args)
      j(path).replaceWith(
        j.callExpression(
          j.memberExpression(
            j.memberExpression(contractExpr, methodName),
            j.identifier(newSuffix)
          ),
          path.node.arguments
        )
      );
      hasChanges = true;
    });

  // Match: contract.functions.method(args) → contract.method(args)
  root
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          property: { name: 'functions' },
        },
      },
    })
    .forEach((path) => {
      const callee = path.node.callee;
      const functionsExpr = callee.object; // X.functions
      const methodName = callee.property; // method
      const contractExpr = functionsExpr.object; // X

      j(path).replaceWith(
        j.callExpression(
          j.memberExpression(contractExpr, methodName),
          path.node.arguments
        )
      );
      hasChanges = true;
    });

  return hasChanges ? root.toSource({ quote: 'single' }) : null;
};

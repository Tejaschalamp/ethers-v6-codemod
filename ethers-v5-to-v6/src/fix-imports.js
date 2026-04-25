/**
 * TRANSFORM 9: Fix named imports from 'ethers'
 *
 * In v5, some things were imported from sub-packages:
 *   import { BigNumber } from 'ethers'  → remove (BigNumber gone, use native BigInt)
 *   import { providers } from 'ethers'  → remove (providers namespace gone)
 *   import { constants } from 'ethers'  → remove (constants namespace gone)
 *
 * Also renames renamed imports:
 *   import { Web3Provider } from 'ethers'  → import { BrowserProvider } from 'ethers'
 *
 * Adds TODO comment when BigNumber is removed so devs know to update usage.
 */

const REMOVE_IMPORTS = new Set(['providers', 'constants']);
const RENAME_IMPORTS = {
  Web3Provider: 'BrowserProvider',
  StaticJsonRpcProvider: 'JsonRpcProvider',
  HDNode: 'HDNodeWallet',
  solidityKeccak256: 'solidityPackedKeccak256',
  soliditySha256: 'solidityPackedSha256',
  solidityPack: 'solidityPacked',
};

module.exports = function (fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let hasChanges = false;
  let bigNumberRemoved = false;

  root
    .find(j.ImportDeclaration, {
      source: { value: 'ethers' },
    })
    .forEach((path) => {
      const specifiers = path.node.specifiers;
      const newSpecifiers = [];

      specifiers.forEach((spec) => {
        if (spec.type !== 'ImportSpecifier') {
          newSpecifiers.push(spec);
          return;
        }

        const name = spec.imported.name;

        // Remove BigNumber (replaced by native BigInt)
        if (name === 'BigNumber') {
          bigNumberRemoved = true;
          hasChanges = true;
          return; // drop this specifier
        }

        // Remove namespace imports (providers, constants)
        if (REMOVE_IMPORTS.has(name)) {
          hasChanges = true;
          return; // drop this specifier
        }

        // Rename renamed imports
        if (RENAME_IMPORTS[name]) {
          spec.imported.name = RENAME_IMPORTS[name];
          if (spec.local.name === name) {
            spec.local.name = RENAME_IMPORTS[name];
          }
          hasChanges = true;
        }

        newSpecifiers.push(spec);
      });

      path.node.specifiers = newSpecifiers;
    });

  // If BigNumber was removed, add a TODO comment at the top of the file
  if (bigNumberRemoved) {
    const comment = j.line(
      ' TODO(ethers-codemod): BigNumber import removed. Replace BigNumber usage with native BigInt (e.g. BigInt("1000") or 1000n)'
    );
    const body = root.find(j.Program).get('body', 0);
    if (body.node) {
      body.node.comments = body.node.comments || [];
      body.node.comments.unshift(comment);
    }
  }

  return hasChanges ? root.toSource({ quote: 'single' }) : null;
};

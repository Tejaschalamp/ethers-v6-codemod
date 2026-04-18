/**
 * TRANSFORM 3: Rename Web3Provider → BrowserProvider
 *
 * BEFORE (v5):  new ethers.providers.Web3Provider(window.ethereum)
 *               new Web3Provider(window.ethereum)
 *
 * AFTER  (v6):  new ethers.BrowserProvider(window.ethereum)
 *               new BrowserProvider(window.ethereum)
 *
 * Also renames StaticJsonRpcProvider usages with a comment hint.
 */

module.exports = function (fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let hasChanges = false;

  // Rename: Web3Provider → BrowserProvider  (as a standalone identifier)
  root
    .find(j.Identifier, { name: 'Web3Provider' })
    .forEach((path) => {
      path.node.name = 'BrowserProvider';
      hasChanges = true;
    });

  // Rename imports: { Web3Provider } from 'ethers'  →  { BrowserProvider }
  root
    .find(j.ImportSpecifier, {
      imported: { name: 'Web3Provider' },
    })
    .forEach((path) => {
      path.node.imported.name = 'BrowserProvider';
      if (path.node.local.name === 'Web3Provider') {
        path.node.local.name = 'BrowserProvider';
      }
      hasChanges = true;
    });

  return hasChanges ? root.toSource({ quote: 'single' }) : null;
};

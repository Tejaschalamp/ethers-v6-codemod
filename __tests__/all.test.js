const path = require('path');
const { applyTransform } = require('jscodeshift/dist/testUtils');
const fs = require('fs');

function runTest(transformName, fixtureName) {
  const transformPath = path.join(__dirname, '..', 'transforms', transformName);
  const inputPath = path.join(__dirname, '..', '__testfixtures__', fixtureName + '.input.js');
  const outputPath = path.join(__dirname, '..', '__testfixtures__', fixtureName + '.output.js');

  const transform = require(transformPath);
  const input = fs.readFileSync(inputPath, 'utf8');
  const expected = fs.readFileSync(outputPath, 'utf8');

  const result = applyTransform(transform, {}, { source: input }, { parser: 'babel' });

  // Normalize line endings for comparison (CRLF -> LF)
  const normalizedResult = result.trim().replace(/\r\n/g, '\n');
  const normalizedExpected = expected.trim().replace(/\r\n/g, '\n');

  expect(normalizedResult).toBe(normalizedExpected);
}

test('remove-utils: ethers.utils.X to ethers.X', () => {
  runTest('remove-utils', 'remove-utils');
});

test('remove-providers: ethers.providers.X to ethers.X', () => {
  runTest('remove-providers', 'remove-providers');
});

test('rename-web3provider: Web3Provider to BrowserProvider', () => {
  runTest('rename-web3provider', 'rename-web3provider');
});

test('bignumber-to-bigint: BigNumber.from(x) to BigInt(x)', () => {
  runTest('bignumber-to-bigint', 'bignumber-to-bigint');
});

test('rename-constants: ethers.constants.X to v6 equivalents', () => {
  runTest('rename-constants', 'rename-constants');
});

test('rename-contract-methods: callStatic and estimateGas bucket renames', () => {
  runTest('rename-contract-methods', 'rename-contract-methods');
});

test('rename-solidity-functions: solidityKeccak256 to solidityPackedKeccak256', () => {
  runTest('rename-solidity-functions', 'rename-solidity-functions');
});

test('fix-imports: clean up named imports from ethers', () => {
  runTest('fix-imports', 'fix-imports');
});

test('rename-misc: HDNode and getGasPrice renames', () => {
  runTest('rename-misc', 'rename-misc');
});

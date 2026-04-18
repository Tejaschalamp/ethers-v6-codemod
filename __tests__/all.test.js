/**
 * Tests for all ethers v5 → v6 transforms
 * Run with: npm test
 */

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

  expect(result.trim()).toBe(expected.trim());
}

test('remove-utils: ethers.utils.X → ethers.X', () => {
  runTest('remove-utils', 'remove-utils');
});

test('remove-providers: ethers.providers.X → ethers.X', () => {
  runTest('remove-providers', 'remove-providers');
});

test('rename-web3provider: Web3Provider → BrowserProvider', () => {
  runTest('rename-web3provider', 'rename-web3provider');
});

test('bignumber-to-bigint: BigNumber.from(x) → BigInt(x)', () => {
  runTest('bignumber-to-bigint', 'bignumber-to-bigint');
});
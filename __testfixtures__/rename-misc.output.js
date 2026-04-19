// OLD v5 code
const node = HDNodeWallet.fromPhrase(phrase);
const price = await // TODO(ethers-codemod): getFeeData() returns FeeData object. Use .gasPrice for legacy or .maxFeePerGas for EIP-1559
provider.getFeeData();

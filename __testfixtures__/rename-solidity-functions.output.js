const hash = ethers.solidityPackedKeccak256(['uint256', 'address'], [amount, addr]);
const packed = ethers.solidityPacked(['uint256'], [amount]);
const sha = ethers.solidityPackedSha256(['bytes'], [data]);

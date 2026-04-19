const hash = ethers.solidityKeccak256(['uint256', 'address'], [amount, addr]);
const packed = ethers.solidityPack(['uint256'], [amount]);
const sha = ethers.soliditySha256(['bytes'], [data]);

const result = await contract.callStatic.balanceOf(addr);
const gas = await contract.estimateGas.transfer(to, amount);
const pop = await contract.populateTransaction.approve(spender, amount);

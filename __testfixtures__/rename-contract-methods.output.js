const result = await contract.balanceOf.staticCall(addr);
const gas = await contract.transfer.estimateGas(to, amount);
const pop = await contract.approve.populateTransaction(spender, amount);

// OLD v5 code
const provider = new ethers.JsonRpcProvider(url);
const ws = new ethers.WebSocketProvider(url);
const fallback = new ethers.FallbackProvider([p1, p2]);

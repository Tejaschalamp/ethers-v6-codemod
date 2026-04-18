// OLD v5 code
const provider = new ethers.providers.JsonRpcProvider(url);
const ws = new ethers.providers.WebSocketProvider(url);
const fallback = new ethers.providers.FallbackProvider([p1, p2]);

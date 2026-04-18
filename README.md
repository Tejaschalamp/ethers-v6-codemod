# ethers-v6-codemod 🔧

Automatically migrates ethers.js v5 code to v6.

## 🚀 Setup (do this once)

```bash
npm install
```

## ✅ Run Tests

```bash
npm test
```

## ▶️ Run on Your Own Code

Put your v5 files in a `src/` folder, then run:

```bash
# Run all transforms at once
npm run run:all

# Or run one at a time:
npm run run:remove-utils
npm run run:remove-providers
npm run run:rename-web3provider
npm run run:bignumber
```

## 📦 What Each Transform Does

| Transform | Before (v5) | After (v6) |
|---|---|---|
| `remove-utils` | `ethers.utils.parseEther(x)` | `ethers.parseEther(x)` |
| `remove-providers` | `ethers.providers.JsonRpcProvider(x)` | `ethers.JsonRpcProvider(x)` |
| `rename-web3provider` | `new Web3Provider(x)` | `new BrowserProvider(x)` |
| `bignumber-to-bigint` | `BigNumber.from(x)` | `BigInt(x)` |

## 📁 Folder Structure

```
ethers-v6-codemod/
├── transforms/              ← codemod scripts
│   ├── remove-utils.js
│   ├── remove-providers.js
│   ├── rename-web3provider.js
│   └── bignumber-to-bigint.js
├── __testfixtures__/        ← sample input/output for tests
└── __tests__/               ← test files
    └── all.test.js
```

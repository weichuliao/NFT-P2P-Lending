# CuterDAO frontend for mutualism

> 使用 VScode editor 對元件或 function 按右鍵能快速查找 Definition 跟 References，
> 能夠快速理解彼此的對應關係。

UI: （建議看的順序）

- src/components/
  - MyCard.jsx :white_check_mark: (JS)
  - DurationBox.jsx :white_check_mark: (React useState)
  - LoanRequestCard.jsx :white_check_mark: (React 元件抽象化)
  - SelectBox.jsx :white_check_mark: (React useState)
- src/views/
  - LoanRequest.jsx :white_check_mark: (React UI library)
  - MyWallet.jsx :white_check_mark: (ES6, JS, React)
- src/App.jsx :white_check_mark: (React router)

Logic Function:

- src/App.jsx :white_check_mark: (把 writeContracts, userSigner, tx... 等方法傳進去)
- src/components/

  - MyWallet.jsx :white_check_mark: (ethers, writeContracts)
    - `getLoansOf()`
    - `creatLoan()`

  > TODO: `getDetailedLoan()`, `dealLoan()`, `repayLoan()`, `claimCollateral()`

# :fire: get start

### 1. 改 hardhat.config.js

- before edit

```javascript
  networks: {
    localhost: {
      url: "http://localhost:8545",
      /*
        notice no mnemonic here? it will just use account 0 of the hardhat node to deploy
        (you can put in a mnemonic here to set the deployer locally)

      */
    },
```

- after edit

```javascript
  networks: {
    localhost: {
      url: "http://localhost:8545",
      chainId: 31337,
      accounts: {
        mnemonic: mnemonic(),
      },
      gas: 2100000,
      gasPrice: 8000000000,
    },
```

<br/>

### 2. 產生 deployer account

```shell
yarn generate
```

跑完會在 `packages/hardhat/` 產生一個地址的 `.txt` 檔案<br/>
檔名是一串英文+數字，是 deployer account address

<br/>

### 3. 跑本地鏈

```shell
yarn chain
```

<br/>

### 4. 部署合約

- 先轉錢給 deployer account
  - 透過 hardhat 預設的註記詞添加小狐狸錢包
  - 錢包 localhost:8545 設定 chainId 改成 31337
  - 跑 `yarn accounts` 查看 deployer account address
  - send tx to deployer account address with 0.1 ETH

```shell
yarn deploy
```

<br/>

### 5. 打開 localhost:3000 ，成功跑起來了！

- but call function error

# 🏄‍♂️ Quick Start

### 1. Clone and install dependencies:

```shell
git clone git@github.com:mutualism-project/final-project-3.git
yarn install
```

### 2. Generate deployer account:

如果 `packages/hardhat/` 底下已經有一個地址的 `.txt` 檔案，可以略過此步驟

```shell
yarn generate
```

跑完會在 terminal 產生一個 address，在 `packages/hardhat/` 也會產生一個地址的 `.txt` 檔案<br/>
檔名是一串英文+數字，是 {{deployer account address}}

### 3. Start your 👷‍ Hardhat chain:

```shell
yarn chain
```

### 4. Deploy your contract in a second terminal window:

> 目前預設網路是 Rinkeby，如果想要部署在本地鏈，修改 `packages/hardhat/hardhat.config.js` 的 defaultNetwork。

```shell
yarn deploy
```

> 此時可能會產生交易失敗：沒有足夠的 gas fee，所以要照著步驟 4.1，用自己的 MetaMask 錢包轉錢到步驟 2. 產生的 deployer account address
> 記得使用 MetaMask 時，要切換到 Rinkeby 測試網路

### 4-1. Transfer ETH to the deployer account:

- deploy on rinkeby:
  > 小狐狸錢包網路切換到 rinkeby，到水龍頭領錢。<br/>
  > 錢包發送 0.01ETH 給 deployer account address<br/>

- deploy on localhost:

  > 將 hardhat 預設的註記詞匯入小狐狸錢包<br/>
  > Hardhat 測試網路預設的助記詞: <br/> > `test test test test test test test test test test test junk`<br/>
  > 錢包網路設定 chainId 調整成跟 hardhat chain 一樣，31337<br/>
  > 錢包發送 0.01ETH 給 deployer account address<br/>

### 5. Start your 📱 frontend in a third terminal window:

```shell
yarn start
```

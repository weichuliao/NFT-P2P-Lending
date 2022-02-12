import "antd/dist/antd.css";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";
import { useContract, useContractWrite } from "wagmi";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import React, { useCallback, useEffect, useState } from "react";
import { Route, Switch, useLocation } from "react-router-dom";
import "./App.css";
import { MyWallet, LoanRequestPage } from "./views";
import { Account, ThemeSwitch, FaucetHint, NetworkSwitch, SiderLayout } from "./components";
import { NETWORKS, ALCHEMY_KEY } from "./constants";
import externalContracts from "./contracts/external_contracts";
// contracts
import deployedContracts from "./contracts/hardhat_contracts.json";
import { Transactor, Web3ModalSetup } from "./helpers";
import { useStaticJsonRPC } from "./hooks";
import stakingTokenAbi from "./contracts/StakingToken.json";

// 目標：[React] 知道 react-router-dom 怎麼切換路由（route、url），切換了路由畫面為什麼會變（Ln. 210）

const { ethers } = require("ethers");

const initialNetwork = NETWORKS.localhost; // <------- select your target frontend network
const DEBUG = true;
const NETWORKCHECK = true;
const USE_BURNER_WALLET = true; // toggle burner wallet feature
const USE_NETWORK_SELECTOR = false;
const web3Modal = Web3ModalSetup();
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "https://rpc.scaffoldeth.io:48544",
];

function App(props) {
  const networkOptions = [initialNetwork.name, "mainnet", "rinkeby"];
  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]);
  const location = useLocation();
  const targetNetwork = NETWORKS[selectedNetwork];
  const blockExplorer = targetNetwork.blockExplorer;
  const localProvider = useStaticJsonRPC([
    process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : targetNetwork.rpcUrl,
  ]);
  const mainnetProvider = useStaticJsonRPC(providers);
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);
  const gasPrice = useGasPrice(targetNetwork, "fast");
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider, USE_BURNER_WALLET);
  const userSigner = userProviderAndSigner.signer;
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;
  const tx = Transactor(userSigner, gasPrice);
  const yourLocalBalance = useBalance(localProvider, address);
  const yourMainnetBalance = useBalance(mainnetProvider, address);
  const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: externalContracts || {} };
  const readContracts = useContractLoader(localProvider, contractConfig);
  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);
  const mainnetContracts = useContractLoader(mainnetProvider, contractConfig);
  const purpose = useContractReader(readContracts, "YourContract", "purpose");
  const myMainnetDAIBalance = useContractReader(mainnetContracts, "DAI", "balanceOf", [
    "0x34aA3F359A9D614239015126635CE7732c18fDF3",
  ]);
  const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name.indexOf("local") !== -1;

  if (DEBUG) console.log(`Using ${selectedNetwork} network`);
  if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);
  useOnBlock(mainnetProvider, () => {
    console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  });
  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };
  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));
    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });
    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });
    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
    // eslint-disable-next-line
  }, [setInjectedProvider]);
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const contractAddr = "0x72b992Beb7D588C6Fe414B237412a5c34669F78c";

  // scaffold-eth
  const contract = useContract({
    addressOrName: contractAddr,
    contractInterface: stakingTokenAbi,
  });
  const createLoanFunc = async () => {
    // const result = await writeContracts(stakingTokenAbi, "0xf57F1239d261Bf27f2332371186BeeAD07c478c0");
    const result = await contract.createLoan(
      address,
      "3",
      address,
      "3",
      "3",
      "0x1f2b4be39ba309bf7a141e392ba147053c84e127",
      "0",
    );
    console.log("result", result);
  };
  // wagmi
  const [{}, createLoan] = useContractWrite(
    {
      addressOrName: contractAddr,
      contractInterface: stakingTokenAbi,
      signerOrProvider: localProvider,
    },
    "createLoan",
  );
  const create = async () => {
    const result = await createLoan({
      args: [address, "3", address, "3", "3", "0x1f2b4be39ba309bf7a141e392ba147053c84e127", "0"],
      overrides: {
        gasLimit: 203000,
        gasPrice: 60000000000,
        value: 1000,
      },
    });
    console.log("result", result);
  };
  const UserInfo = () => {
    return (
      <div>
        <div style={{ display: "flex", flex: 1, alignItems: "center", width: "100%" }}>
          {USE_NETWORK_SELECTOR && (
            <div style={{ marginRight: 20 }}>
              <NetworkSwitch
                networkOptions={networkOptions}
                selectedNetwork={selectedNetwork}
                setSelectedNetwork={setSelectedNetwork}
              />
            </div>
          )}
          <Account
            useBurner={USE_BURNER_WALLET}
            address={address}
            localProvider={localProvider}
            userSigner={userSigner}
            mainnetProvider={mainnetProvider}
            price={price}
            web3Modal={web3Modal}
            loadWeb3Modal={loadWeb3Modal}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
            blockExplorer={blockExplorer}
          />
        </div>
        {yourLocalBalance.lte(ethers.BigNumber.from("0")) && (
          <FaucetHint localProvider={localProvider} targetNetwork={targetNetwork} address={address} />
        )}
      </div>
    );
  };
  const NetworkDisplay = () => {
    return (
      <div style={{ border: "1px solid gray" }}>
        <NetworkDisplay
          NETWORKCHECK={NETWORKCHECK}
          localChainId={localChainId}
          selectedChainId={selectedChainId}
          targetNetwork={targetNetwork}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          USE_NETWORK_SELECTOR={USE_NETWORK_SELECTOR}
        />
      </div>
    );
  };
  return (
    <SiderLayout extra={<UserInfo />}>
      <NetworkDisplay />
      {/* react-router-dom 看這邊 */}
      <Switch>
        <Route exact path="/">
          <MyWallet createLoan={createLoanFunc} />
        </Route>
        <Route exact path="/loan-request">
          <LoanRequestPage />
        </Route>
      </Switch>
      <ThemeSwitch />
    </SiderLayout>
  );
}

export default App;

import "antd/dist/antd.css";
import {
	useBalance,
	useContractLoader,
	useContractReader,
	useGasPrice,
	useOnBlock,
	useUserProviderAndSigner,
} from "eth-hooks";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import React, { useCallback, useEffect, useState } from "react";
import { Route, Switch } from "react-router-dom";
import "./App.css";
import { MyWallet, LoanRequestPage } from "./views";
import {
	Account,
	ThemeSwitch,
	FaucetHint,
	NetworkSwitch,
	SiderLayout
} from "./components";
import { NETWORKS, ALCHEMY_KEY } from "./constants";
import externalContracts from "./contracts/external_contracts";
// contracts
import deployedContracts from "./contracts/hardhat_contracts.json";
import { Transactor, Web3ModalSetup } from "./helpers";
import { useStaticJsonRPC } from "./hooks";

// 目標：[React] 知道 react-router-dom 怎麼切換路由（route、url），切換了路由畫面為什麼會變（Ln. 210）

/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/scaffold-eth/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Alchemy.com & Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)

    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

const { ethers } = require("ethers");
const initialNetwork = NETWORKS.rinkeby; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true;
const NETWORKCHECK = true;
const USE_BURNER_WALLET = true; // toggle burner wallet feature
const USE_NETWORK_SELECTOR = false;

const web3Modal = Web3ModalSetup();

// 🛰 providers
const providers = [
	"https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
	`https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
	"https://rpc.scaffoldeth.io:48544",
];

function App(props) {
	// specify all the chains your app is available on. Eg: ['localhost', 'mainnet', ...otherNetworks ]
	// reference './constants.js' for other networks
	const networkOptions = [initialNetwork.name, "mainnet", "rinkeby"];
	const [injectedProvider, setInjectedProvider] = useState();
	const [address, setAddress] = useState();
	const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[2]);

	const targetNetwork = NETWORKS[selectedNetwork];

	// 🔭 block explorer URL
	const blockExplorer = targetNetwork.blockExplorer;

  	// load all your providers
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
	// 跟 contracts 互動的相關 functions
	const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: externalContracts || {} };
	const readContracts = useContractLoader(localProvider, contractConfig);
	const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

	// if (DEBUG) console.log(`Using ${selectedNetwork} network`);
	// 🛰 providers
	// if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");

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
		// console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
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
			// console.log(`chain changed to ${chainId}! updating providers`);
			setInjectedProvider(new ethers.providers.Web3Provider(provider));
		});
		provider.on("accountsChanged", () => {
			// console.log(`account changed!`);
			setInjectedProvider(new ethers.providers.Web3Provider(provider));
		});
		// Subscribe to session disconnection
		provider.on("disconnect", (code, reason) => {
			// console.log(code, reason);
			logoutOfWeb3Modal();
		});
		// eslint-disable-next-line
	}, [setInjectedProvider]);

	useEffect(() => {
		if (web3Modal.cachedProvider) {
			loadWeb3Modal();
		}
	}, [loadWeb3Modal]);

	// const createLoanFunc = () => {};

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
		{/* react-router-dom 看這邊 */}
		<Switch>
			<Route exact path="/">
			<MyWallet
				address={address}
				// createLoan={createLoanFunc}
				writeContracts={writeContracts}
				readContracts={readContracts}
				userSigner={userSigner}
				tx={tx}
			/>
			</Route>
			<Route exact path="/loan-request">
				<LoanRequestPage
					address={address}
					writeContracts={writeContracts}
					readContracts={readContracts}
					userSigner={userSigner}
					tx={tx}
				/>
			</Route>
		</Switch>
		<ThemeSwitch />
		</SiderLayout>
	);
}

export default App;
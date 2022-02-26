import React, { useState, useEffect } from "react";
import { Modal, Button } from "antd";
import MyCard from "../components/MyCard";
import SelectBox from "../components/SelectBox";
import DurationBox from "../components/DurationBox";
import "antd/dist/antd.css";
// 在 ./constance 裡，OPENSEADOMAIN 不是用 export default 的方式 export 出來，所以在引用的時候必須要加 {} 才拿得到裡面的東西，也是一種解構賦值的例子。
import { OPENSEADOMAIN } from "./constance";
import ERC721 from "../contracts/erc721abi.json";
const { ethers } = require("ethers");

// 目標：
// 1. [ES6] 知道 import { Something } from "./folder" 跟 import Something from "./folder" 的差別
// 2. [JS] 存取瀏覽器的 localStorage
// 3. [React] useEffect 的 dependencies 用法
// 4. [JS] fetch api 後取得需要的資料
// 5. [ethers] 傳數字給合約時要用 ethers.utils.parseEther(10);

const MyWallet = ({ address, writeContracts, userSigner, tx }) => {
	const [NFTs, setNFTs] = useState();
	const [loans, setLoans] = useState();
	const [loanID, setLoanID] = useState();	// 先觀察一下，好像可以不用

	const [priceUnit, setPriceUnit] = useState("ETH");
	const [principal, setPrincipal] = useState("");
	const [repayment, setRepayment] = useState("");
	const [duration, setDuration] = useState("");

	const [targetNFT, setTargetNFT] = useState();
	const [targetLoan, setTargetLoan] = useState();

	const [isConfirming, setIsConfirming] = useState(false);
	const [isConfirmed, setIsConfirmed] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const verifySubmit = principal !== "" && repayment !== "" && duration !== "" && NFTs !== null; // 控制彈窗的 ok button 能不能按

	// 從瀏覽器的 localstorage 拿取 account，如果要 set 就是用 window.localStorage.setItem(key, value);
	// const userAddr = window.localStorage.getItem("account");

	useEffect(() => {
		getNFTOf(address);
		getLoansOf(address);
	}, [address]);

	const getNFTOf = async address => {
		// if (!address || !userAddr) return;
		if (!address) return;
		// fetch(`${OPENSEADOMAIN.TEST}/assets?owner=${userAddr}`)
		const NFTs = await fetch(`${OPENSEADOMAIN.TEST}/assets?owner=${address}`)
			.then(res => res.json()) // call api拿到的東西沒辦法直接取用，用 json() 先轉換成json格式
			.then(res => {
				// 先console.log(res) 看我們要的assets在哪邊，再用 object.key 的方式去取 value
				return res?.assets
				?.filter(el => el.asset_contract.schema_name === "ERC721")
				?.map(el => ({
					title: el.collection.name,
					image: el.image_preview_url,
					address: el.asset_contract.address,
					tokenID: el.token_id,
            	}));
			}
		);
		if (NFTs) setNFTs(NFTs);
	};

	const getLoansOf = async borrower => {
		const res = await writeContracts?.StakingToken?.getLoansOf(borrower);
		console.log("My wallet getLoansOf");
		console.log(res);
		if (res) {
			const doSomethingAsync = async el => {
				const tokenID = el.nftTokenID.toString();
				const nftData = await fetch(`${OPENSEADOMAIN.TEST}/asset/${el.nftTokenAddress}/${tokenID}`).then(x => x.json());
				return {
					status: el.status.toString(),
					loanID: el.loanID.toString(),
					title: nftData?.asset_contract?.name,
					image: nftData?.image_preview_url,
					address: el.nftTokenAddress,
					tokenID: tokenID,
					principal: el.principal.toString(),
					repayment: el.repayment.toString(),
					deadline: el.deadline.toString(),
					borrower: el.borrower,
				};
			};
			const f = x => new Promise(resolve => setTimeout(() => resolve(doSomethingAsync(x)), 500));
			let myData = [];
			for (let job of res.map(x => () => f(x))) {
				const item = await job();
				myData.push(item);
			}
			console.log(myData);
			setLoans(myData);
		}
		return;
	};

	const createLoan = async () => {
		console.log(
			`principal: ${priceUnit} ${principal}, repayment: ${priceUnit}${repayment}, duration: ${Number(duration) * 60 * 60 * 24}}, nft address: ${targetNFT.address}, nft token: ${targetNFT.tokenID}`,
		);
		const nftTokenAddress = targetNFT?.address;
		const nftTokenID = Number(targetNFT?.tokenID);

		// approve for transfer NFT
		setIsConfirming(true);
		const nftContract = await new ethers.Contract(nftTokenAddress, ERC721.abi, userSigner);
		let approveTransaction = await nftContract.approve(writeContracts.StakingToken.address, Number(nftTokenID));
		await approveTransaction.wait();
		setIsConfirming(false);
		setIsConfirmed(true);

		await tx(
			writeContracts.StakingToken.createLoan(
				// address,
				Number(duration) * 60 * 60 * 24,
				ethers.utils.parseEther(principal),
				ethers.utils.parseEther(repayment),
				nftTokenAddress,
				nftTokenID,
			),
		).then(loanID => setLoanID(loanID));
		setIsConfirming(false);

		// 要 close modal
		setIsModalVisible(false)
	};

	const cancelLoanRequest = async loanID => {
		console.log("Cancel Loan: " + loanID);
		await tx(writeContracts.StakingToken.removeLoan(Number(loanID)));
	}

	const repayLoanRequest = async targetLoan => {
		console.log("Repay Loan: " + targetLoan.loanID);
		await tx(writeContracts.StakingToken.repayLoan(Number(targetLoan.loanID), { value: ethers.BigNumber.from(targetLoan.principal) }));
	}

	const handleOnSubmit = () => {
		createLoan();
		// for debug: log 出來看跟輸入的是否一樣
		console.log(
			`principal: ${priceUnit} ${principal}, repayment: ${priceUnit}${repayment}, duration: ${duration}`,
		);
	};

	return (
		<>
		<div
			style={{
			display: "flex",
			width: "100%",
			maxHeight: "80vh",
			overflow: "scroll",
			flexWrap: "wrap",
			}}
		>
			{NFTs && NFTs.map((ele) => {
				return (
					<MyCard key={ele.token_id} data={ele} type={"NFT"}>
						<Button
							type="primary"
							onClick={() => {
								setTargetNFT(ele);
								setIsModalVisible(true);
							}}
						>
							Create Loan Request
						</Button>
					</MyCard>
				);
			})}
			{loans && loans.map((ele) => {
				if (ele.status == "3") {
					return (
						<MyCard key={ele.token_id} data={ele} type={"loan"}>
							<Button
								type="primary"
								onClick={() => repayLoanRequest(ele)}
							>
								Repay Loan
							</Button>
						</MyCard>
					);
				} else {
					return (
						<MyCard key={ele.address.toString()} data={ele} type={"loan"}>
							<Button
								type="primary"
								onClick={() => cancelLoanRequest(ele.loanID)}
							>
								Cancel Loan Request
							</Button>
						</MyCard>
					);
				}
			})}
		</div>
		{/* 彈窗開關由 <Button> Create Loan Request </Button> 的 onClick={() => setIsModalVisible(true)} 控制 */}
		<Modal
			title="Create Loan Request"
			// 彈窗開關由 setIsModalVisible(true) 控制
			visible={isModalVisible}
			width={800}
			okButtonProps={{ disabled: !verifySubmit }}
			onOk={handleOnSubmit}
			onCancel={() => setIsModalVisible(false)}
			okText={isConfirming ? "Confirming..." : "Confirmed"}
		>
			<SelectBox
				inputOnChange={e => setPrincipal(e)}
				title="What do you want to borrow"
				selectedValue={priceUnit}
				selectOnChange={e => setPriceUnit(e)}
			/>
			<SelectBox
				inputOnChange={e => setRepayment(e)}
				title="Set repayment amount"
				selectedValue={priceUnit}
				selectOnChange={e => setPriceUnit(e)}
			/>
			<DurationBox
				duration={duration} setDuration={e => setDuration(e)}
			/>
		</Modal>
		</>
	);
};

export default MyWallet;
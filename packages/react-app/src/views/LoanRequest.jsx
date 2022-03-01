import React, { useState, useEffect } from "react";
import "antd/dist/antd.css";
import { List, Image, Button } from "antd";
import { LoanRequestCard } from "../components/LoanRequestCard";
import { loanRequestMockData } from "../mockdata/mockData";
import { OPENSEADOMAIN } from "./constance";
const { ethers } = require("ethers");

// 目標：[React] 如何用現有的 UI library 做 LoanRequest 頁面，顯示假資料的 Request

const LoanRequestPage = ({ address, writeContracts, readContracts, userSigner, tx }) => {
	const [loans, setLoans] = useState();

	useEffect(() => {
		getAllLoanRequests();
	}, []);

	const getAllLoanRequests = async () => {
		const res = await readContracts?.StakingToken?.getAllLoanRequests();
		console.log("LoanRequest getAllLoanRequests");
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
			setLoans(myData);
		}
	}

	const handleClick = async targetLoan => {
		console.log(targetLoan.loanID);
		console.log(targetLoan.principal);
		await tx(writeContracts.StakingToken.dealLoan(Number(targetLoan.loanID), { value: ethers.BigNumber.from(targetLoan.principal) }));
  	};
	  
	return (
		<div>
			{loans && loans.map((el) => {
				return (
					<LoanRequestCard
						key={el.tokenID}
						data={el}
						image={el.image}
						title={el.title}
						address={el.address}
						loanID={el.loanID}
						principal={el.principal}
						repayment={el.repayment}
						duration={el.deadline}
						// 為什麼是 handleClick 不是 handleClick()？
						// 因為 handleClick() 代表立即執行，但我們希望在 <LoanRequestCard/>
						// 內部 onClick 事件被觸發才執行，所以不寫 ()
						onClick={handleClick}
					/>
				);
			})}
		</div>
	);
};

export default LoanRequestPage;
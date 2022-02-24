import React from "react";
import { Card } from "antd";
import "antd/dist/antd.css";

// 目標：
//  1. [JS] 知道什麼是解構賦值，怎麼用。
//  2. [JS] isActive ? "" : "2px solid #8143DE" 是什麼意思。

const MyCard = ({ children, data, type }) => {
	// 沒有資料就不繼續執行
	if (!data) return;

	// 解構賦值(js 重要)：將物件中的 key 用 const {} 的方式，取得該 key 對應的 value。
	const { image, address, tokenID } = data;

	// 在父層判斷這個 NFT 是否已經被 Deal，再把狀態 active 傳進來。
	// const isActive = active;
	return (
		<Card
			style={{
				width: 250,
				margin: "1rem",
				borderRadius: 15,
				// 精簡的 if else 寫法，如果 isActive 為 true，border style = ""，反之給予 "2px solid #8143DE"
				border: (type == "loan") ? "" : "2px solid #8143DE",
				boxShadow: "1px 1px 12px 1px rgba(0,0,0,0.29)",
			}}
			cover={
				<img
				style={{
					width: "100%",
					maxHeight: "250px",
					padding: (type == "loan") ? "" : "2px",
					borderRadius: "15px 15px 0 0",
				}}
				alt="example"
				src={image}
				/>
			}
			>
			<p style={{ width: "100%", overflow: "hidden" }}>contractAddr: {address}</p>
			<p style={{ width: "100%", overflow: "hidden" }}>tokenId: {tokenID}</p>
			{children}
		</Card>
	);
};
export default MyCard;
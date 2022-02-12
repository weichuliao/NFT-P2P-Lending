import React from "react";
import "antd/dist/antd.css";
import { Button, Image } from "antd";

// 目標：[React] 練習元件抽象化
// 把 LoanRequestCard 分成三個 component，練習元件抽象化
// step 1: 找出要抽象化的元件，可以由這兩個條件判斷：
//  1. 很冗長的 NFTInfo
//  2. 重複使用的 Info
// step2: 設定要傳入的參數，例：
//  1. NFTInfo 是共用的元件，有三筆資料就會顯示三個LoanRequestCard，所以資料不能寫死，資料由父層動態載入而呈現
//  （可以看 'src/views/LoanRequest.jsx'）
//  2. 三個 Info 結構都一樣，只有 title 跟 description 不一樣所以就將這兩個直當作參數傳入

const NFTInfo = ({ title, addr, loanTermId }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <h5>{title}</h5>
      <p>by: {addr}</p>
      <p>LoanTermId: {loanTermId}</p>
    </div>
  );
};
const Info = ({ title, description }) => {
  return (
    <div style={{ textAlign: "center" }}>
      <h5>{title}</h5>
      <p>{description}</p>
    </div>
  );
};
export const LoanRequestCard = ({ imgUrl, title, addr, loanTermId, principle, repayment, duration, onClick }) => {
  return (
    <div
      key={imgUrl}
      style={{
        width: "100%",
        display: "flex",
        backgroundColor: "white",
        height: "120px",
        margin: "1rem 0",
        padding: "1rem",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Image width={100} src={imgUrl} />
      <NFTInfo title={title} addr={addr} loanTermId={loanTermId} />
      <Info title={principle} description="Principal" />
      <Info title={repayment} description="Repayment" />
      <Info title={duration} description="Duration" />
      <Button type="primary" onClick={onClick}>
        Deal
      </Button>
    </div>
  );
};
export default LoanRequestCard;

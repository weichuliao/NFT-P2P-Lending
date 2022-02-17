import React from "react";
import "antd/dist/antd.css";
import { List } from "antd";
import { LoanRequestCard } from "../components/LoanRequestCard";
import { loanRequestMockData } from "../mockdata/mockData";

// 目標：[React] 如何用現有的 UI library 做 LoanRequest 頁面，顯示假資料的 Request

const LoanRequestPage = () => {
  const handleClick = () => {
    console.log("handleClick");
  };
  return (
    <List
      itemLayout="vertical"
      size="large"
      // 假資料放在 dataSource 裡，是 antd 定義好要傳入的參數，
      // 不用 antd 的話也有其他方式可以做到，開發中追求快速驗證資
      // 料邏輯，使用 antd 可以省下不少時間。
      dataSource={loanRequestMockData}
      pagination={{ pageSize: 4, hideOnSinglePage: true }}
      // 這邊應該是用 js 中 array.mapping() 的方式將資料遍歷出來
      // 將 mockData 中，每個 index 的資料放到 <LoanRequestCard/> 的參數中
      renderItem={item => (
        <LoanRequestCard
          imgUrl={item.imgUrl}
          title={item.title}
          addr={item.addr}
          loanTermId={item.loanTermId}
          principle={item.principle}
          repayment={item.repayment}
          duration={item.duration}
          // 為什麼是 handleClick 不是 handleClick()？
          // 因為 handleClick() 代表立即執行，但我們希望在 <LoanRequestCard/>
          // 內部 onClick 事件被觸發才執行，所以不寫 ()
          onClick={handleClick}
        />
      )}
    />
  );
};

export default LoanRequestPage;

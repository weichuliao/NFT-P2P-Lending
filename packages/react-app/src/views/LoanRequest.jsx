import React from "react";
import "antd/dist/antd.css";
import { List } from "antd";
import { LoanRequestCard } from "../components/LoanRequestCard";
import { loanRequestMockData } from "../data/mockData";

const LoanRequest = () => {
  const handleClick = () => {
    console.log("handleClick");
  };
  return (
    <List
      itemLayout="vertical"
      size="large"
      dataSource={loanRequestMockData}
      pagination={{
        onChange: page => {
          console.log(page);
        },
        pageSize: 4,
        hideOnSinglePage: true,
      }}
      renderItem={item => (
        <LoanRequestCard
          imgUrl={item.imgUrl}
          title={item.title}
          addr={item.addr}
          loanTermId={item.loanTermId}
          principle={item.principle}
          repayment={item.repayment}
          duration={item.duration}
          onClick={handleClick}
        />
      )}
    />
  );
};

export default LoanRequest;

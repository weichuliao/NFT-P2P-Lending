import React from "react";
import "antd/dist/antd.css";
import { Button, Image } from "antd";

const DetailCol = ({ title, description }) => {
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
      <DetailCol title={principle} description="Principal" />
      <DetailCol title={repayment} description="Repayment" />
      <DetailCol title={duration} description="Duration" />
      <Button type="primary" onClick={onClick}>
        Deal
      </Button>
    </div>
  );
};
export default LoanRequestCard;

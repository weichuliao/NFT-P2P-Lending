import React from "react";
import { Card } from "antd";
import "antd/dist/antd.css";

const MyCard = ({ children, data }) => {
  if (!data) return;
  const { image_url, asset_contract, token_id } = data;
  const isAvailable = true; // TODO: use nftContract addr to ask our contract is it available
  return (
    <Card
      style={{
        width: 250,
        margin: "1rem",
        borderRadius: 15,
        border: isAvailable ? "" : "2px solid #8143DE",
        boxShadow: "1px 1px 12px 1px rgba(0,0,0,0.29)",
      }}
      cover={
        <img
          style={{
            width: "100%",
            maxHeight: "250px",
            padding: isAvailable ? "" : "2px",
            borderRadius: "15px 15px 0 0",
          }}
          alt="example"
          src={image_url}
        />
      }
    >
      <p style={{ width: "100%", overflow: "hidden" }}>contractAddr: {asset_contract.address}</p>
      <p style={{ width: "100%", overflow: "hidden" }}>tokenId: {token_id}</p>
      {children}
    </Card>
  );
};
export default MyCard;

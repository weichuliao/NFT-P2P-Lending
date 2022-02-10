import React, { useEffect } from "react";
import { Button } from "antd";
import "antd/dist/antd.css";

const CoinbaseBtn = ({ handleConnected }) => {
  const connectToCoinbase = async () => {};
  return (
    <Button onClick={connectToCoinbase} className="mx-2" type="primary">
      Coinbase
    </Button>
  );
};

export default CoinbaseBtn;

import React, { useEffect } from "react";
import { Button } from "antd";
// import WalletConnectProvider from "@walletconnect/web3-provider";
import "antd/dist/antd.css";

// ref: https://codesandbox.io/s/2mgd4?file=/src/index.js:619-679
// const wcProvider = new WalletConnectProvider({
//   infuraId: "93761f6a65d0447999e9585aa8958d3a", // Required，需要換成Jacky開的不然網站打不開
// });

const WalletConnectBtn = ({ handleConnected }) => {
  // useEffect(() => {
  //   wcProvider.on("connect", () => {
  //     console.log("connect");
  //   });
  // });
  const connectToWalletConnect = async () => {
    // try {
    //   await wcProvider.enable().then(() => {
    //     // TODO: set user address in localStorage
    //     handleConnected();
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
  };
  return (
    <Button onClick={connectToWalletConnect} className="mx-2" type="primary">
      WalletConnect
    </Button>
  );
};

export default WalletConnectBtn;

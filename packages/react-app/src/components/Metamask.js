import React, { useState, useEffect, useRef } from "react";
import { Button } from "antd";
// import MetaMaskOnboarding from "@metamask/onboarding";
// import "antd/dist/antd.css";

const CONNECT_TEXT = "Connect to MetaMask";
const CONNECTED_TEXT = "MetaMask Connected";

const MetaMaskBtn = ({ handleConnected }) => {
  const [buttonText, setButtonText] = useState(CONNECT_TEXT);
  const [isDisabled, setDisabled] = useState(false);
  //   const [accounts, setAccounts] = useState([]);
  //   const onboarding = useRef();
  //   useEffect(() => {
  //     if (!onboarding.current) {
  //       onboarding.current = new MetaMaskOnboarding();
  //     }
  //   }, []);
  //   useEffect(() => {
  //     if (MetaMaskOnboarding.isMetaMaskInstalled()) {
  //       // 如果有metamask插件，檢查account是否大於零，是就把按鈕的字樣改成"Connected"，並且disable，沒辦法繼續按按鈕
  //       if (accounts.length > 0) {
  //         setButtonText(CONNECTED_TEXT);
  //         setDisabled(true);
  //         handleConnected();
  //         onboarding.current.stopOnboarding();
  //       } else {
  //         setButtonText(CONNECT_TEXT);
  //         setDisabled(false);
  //       }
  //     }
  //   }, [accounts]); // 只有在accounts改變的時候需要執行上面{}內的程式
  //   useEffect(() => {
  //     if (MetaMaskOnboarding.isMetaMaskInstalled()) {
  //       window.ethereum
  //         .request({ method: "eth_requestAccounts" }) // 跟window.ethereum要目前錢包內的帳號資訊
  //         .then(handleNewAccounts); // 要到之後將state變數accounts更新，更新後就會執行第31行的useEffect
  //       handleConnected();
  //       window.ethereum.on("accountsChanged", handleNewAccounts);
  //       return () => {
  //         window.ethereum.removeListener("accountsChanged", handleNewAccounts);
  //       };
  //     }
  //   }, []); // [] 內沒有dependencies意思是，進來網頁的時候的時候只執行一次
  const connectToMetamask = () => {
    //     if (MetaMaskOnboarding.isMetaMaskInstalled()) {
    //       window.ethereum
    //         .request({
    //           method: "eth_requestAccounts",
    //         })
    //         .then((newAccounts) => {
    //           setAccounts(newAccounts);
    //           window.localStorage.setItem("account", newAccounts); // 存在瀏覽器的 localstorage 裏面
    //           handleConnected();
    //         });
    //       window.ethereum.on("accountsChanged", handleNewAccounts);
    //     } else {
    //       onboarding.current.startOnboarding();
    //     }
    // };
    //   function handleNewAccounts(newAccounts) {
    //     window.localStorage.setItem("account", newAccounts); // 存在瀏覽器的 localstorage 裏面
    //     setAccounts(newAccounts);
  };
  return (
    <Button variant="contained" onClick={connectToMetamask} disabled={isDisabled}>
      {buttonText}
    </Button>
  );
};

export default MetaMaskBtn;

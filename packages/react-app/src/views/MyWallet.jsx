import React, { useState, useEffect } from "react";
import { Modal, Button } from "antd";
import MyCard from "../components/MyCard";
import SelectBox from "../components/SelectBox";
import DurationBox from "../components/DurationBox";
import "antd/dist/antd.css";
// 在 ./constance 裡，OPENSEADOMAIN 不是用 export default 的方式 export 出來，所以在引用的時候必須要加 {} 才拿得到裡面的東西，也是一種解構賦值的例子。
import { OPENSEADOMAIN } from "./constance";
const { ethers } = require("ethers");

// 目標：
// 1. [ES6] 知道 import { Something } from "./folder" 跟 import Something from "./folder" 的差別
// 2. [JS] 存取瀏覽器的 localStorage
// 3. [React] useEffect 的 dependencies 用法
// 4. [JS] fetch api 後取得需要的資料
// 5. [ethers] 傳數字給合約時要用 ethers.utils.parseEther(10);

const MyWallet = ({ address, writeContracts, userSigner, tx }) => {
  const [borrowPrice, setBorrowPrice] = useState("");
  const [repaymentPrice, setRepaymentPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [userNFTs, setUserNFTs] = useState();
  const [userLoans, setUserLoans] = useState();
  const [loanId, setLoanId] = useState();
  const [priceUnit, setPriceUnit] = useState("ETH");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [target, setTarget] = useState();
  // 從瀏覽器的 localstorage 拿取 account，如果要 set 就是用 window.localStorage.setItem(key, value);
  const userAddr = window.localStorage.getItem("account");
  const verifySubmit = borrowPrice !== "" && repaymentPrice !== "" && duration !== "" && userNFTs !== null; // 控制彈窗的 ok button 能不能按

  useEffect(() => {
    getNFTOf(address);
    getLoansOf(address);
  }, [address]);

  const getLoansOf = async borrower => {
    const res = await writeContracts?.StakingToken?.getLoansOf(borrower);
    setUserLoans(res);
    return;
  };
  const getNFTOf = address => {
    if (!address || !userAddr) return;
    fetch(`${OPENSEADOMAIN.TEST}/assets?owner=${userAddr}`)
      .then(res => res.json()) // call api拿到的東西沒辦法直接取用，用 json() 先轉換成json格式
      .then(res => {
        // 先console.log(res) 看我們要的assets在哪邊，再用 object.key 的方式去取 value
        const assets = res.assets;
        setUserNFTs(assets);
      });
  };
  const creatLoan = async () => {
    let endingBidTime = new Date();
    endingBidTime.setMinutes(endingBidTime.getMinutes() + 10);
    const _nftTokenAddress = target?.asset_contract.address;
    const _nftTokenID = target?.token_id;
    await tx(
      writeContracts.StakingToken.creatLoan(
        address,
        Number(duration) * 60 * 60 * 24,
        ethers.utils.parseEther(borrowPrice),
        ethers.utils.parseEther(repaymentPrice),
        _nftTokenAddress,
        _nftTokenID,
      ),
    ).then(loanId => setLoanId(loanId));
  };
  const handleOnSubmit = () => {
    creatLoan();
    // for debug: log 出來看跟輸入的是否一樣
    console.log(
      `borrowPrice: ${priceUnit} ${borrowPrice}, repaymentPrice: ${priceUnit}${repaymentPrice}, duration: ${duration}`,
    );
  };
  return (
    <>
      <div
        style={{
          display: "flex",
          width: "100%",
          maxHeight: "80vh",
          overflow: "scroll",
          flexWrap: "wrap",
        }}
      >
        {userNFTs &&
          userNFTs.map(i => {
            // 拿鏈上資料跟 Opensea 比對是否正在出租
            let isActive = true;
            const nftAddr = i.asset_contract.address;
            let isLoan = "";
            userLoans.forEach(i => {
              if (i === nftAddr) isLoan = i;
            });
            if (isLoan) isActive = false;
            return (
              <MyCard data={i} active={isActive}>
                <Button
                  type="primary"
                  onClick={() => {
                    setTarget(i);
                    setIsModalVisible(true);
                  }}
                >
                  Create Loan Request
                </Button>
              </MyCard>
            );
          })}
      </div>
      {/* 彈窗開關由 <Button> Create Loan Request </Button> 的 onClick={() => setIsModalVisible(true)} 控制 */}
      <Modal
        title="Create Loan Request"
        // 彈窗開關由 setIsModalVisible(true) 控制
        visible={isModalVisible}
        width={800}
        okButtonProps={{ disabled: !verifySubmit }}
        onOk={handleOnSubmit}
        onCancel={() => setIsModalVisible(false)}
      >
        <SelectBox
          inputOnChange={e => setBorrowPrice(e)}
          title="What do you want to borrow"
          selectedValue={priceUnit}
          selectOnChange={e => setPriceUnit(e)}
        />
        <SelectBox
          inputOnChange={e => setRepaymentPrice(e)}
          title="Set repayment amount"
          selectedValue={priceUnit}
          selectOnChange={e => setPriceUnit(e)}
        />
        <DurationBox duration={duration} setDuration={e => setDuration(e)} />
      </Modal>
    </>
  );
};

export default MyWallet;

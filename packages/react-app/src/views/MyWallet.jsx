import React, { useState, useEffect } from "react";
import { Modal, Button } from "antd";
import MyCard from "../components/Card";
import SelectBox from "../components/SelectBox";
import DurationBox from "../components/DurationBox";
import "antd/dist/antd.css";
import { OPENSEADOMAIN } from "./constance"; // 因為在 ./constance 裡，OPENSEADOMAIN 不是用 export default 的方式 export 出來，所以在引用的時候必須要加 {} 才拿得到裡面的東西。

const MyWallet = ({ createLoan }) => {
  const [borrowPrice, setBorrowPrice] = useState("");
  const [repaymentPrice, setRepaymentPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [data, setData] = useState();
  const [priceUnit, setPriceUnit] = useState("ETH");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const userAddr = window.localStorage.getItem("account"); // 從瀏覽器的localstorage拿取account

  useEffect(() => {
    getAllNftData();
  }, [userAddr]);

  const getAllNftData = () => {
    if (!userAddr) return;
    // 使用 opensea 提供的 api，因應環境切換有不同的api，把api domain 設置成常數
    fetch(`${OPENSEADOMAIN.TEST}/assets?owner=${userAddr}`)
      .then(res => res.json()) // call api拿到的東西沒辦法直接取用，所以用 json() 先轉換成json格式
      .then(res => {
        // 先console.log(res) 看我們要的assets在哪邊，再用物件 . 的方式去取
        const assets = res.assets;
        setData(assets);
      });
  };

  const handleOnSubmit = () => {
    createLoan();
    console.log(
      `borrowPrice: ${priceUnit} ${borrowPrice}, repaymentPrice: ${priceUnit}${repaymentPrice}, duration: ${duration}`,
    );
    // TODO: interact with the contract
  };
  const verifySubmit = borrowPrice !== "" && repaymentPrice !== "" && duration !== "" && data !== null; // 控制彈窗的 ok button 能不能按

  return (
    <>
      {/* list user all NFT on opensea (opensea提供的api, test production 都拿得到) */}
      <div
        style={{
          display: "flex",
          width: "100%",
          maxHeight: "80vh",
          overflow: "scroll",
          flexWrap: "wrap",
        }}
      >
        {data &&
          data.map(i => (
            <MyCard data={i}>
              <Button type="primary" onClick={() => setIsModalVisible(true)}>
                Create Loan Request
              </Button>
            </MyCard>
          ))}
      </div>
      {/* 彈窗開關由 <Button>Create Loan Request</Button> 的 onClick={() => setIsModalVisible(true)} 控制 */}
      <Modal
        title="Create Loan Request"
        visible={isModalVisible}
        width={800}
        okButtonProps={{ disabled: !verifySubmit }}
        onOk={handleOnSubmit}
        onCancel={() => setIsModalVisible(false)}
      >
        <SelectBox
          inputOnChange={e => setBorrowPrice(e)}
          title="What do you want to borrow"
          selectValue={priceUnit}
          selectOnChange={e => setPriceUnit(e)}
        />
        <SelectBox
          inputOnChange={e => setRepaymentPrice(e)}
          title="Set repayment amount"
          selectValue={priceUnit}
          selectOnChange={e => setPriceUnit(e)}
        />
        <DurationBox duration={duration} setDuration={e => setDuration(e)} />
      </Modal>
    </>
  );
};

export default MyWallet;

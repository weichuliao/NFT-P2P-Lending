import React, { useState, useEffect } from "react";
import { Modal, Button } from "antd";
import MyCard from "../components/MyCard";
import SelectBox from "../components/SelectBox";
import DurationBox from "../components/DurationBox";
import "antd/dist/antd.css";
// 在 ./constance 裡，OPENSEADOMAIN 不是用 export default 的方式 export 出來，所以在引用的時候必須要加 {} 才拿得到裡面的東西，也是一種解構賦值的例子。
import { OPENSEADOMAIN } from "./constance";

// 目標：
// 1. [ES6] 知道 import { Something } from "./folder" 跟 import Something from "./folder" 的差別
// 2. [JS] 存取瀏覽器的 localStorage
// 3. [React] useEffect 的 dependencies 用法
// 4. [JS] fetch api 後取得需要的資料

const MyWallet = ({ createLoan }) => {
  const [borrowPrice, setBorrowPrice] = useState("");
  const [repaymentPrice, setRepaymentPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [data, setData] = useState();
  const [priceUnit, setPriceUnit] = useState("ETH");
  const [isModalVisible, setIsModalVisible] = useState(false);
  // 從瀏覽器的 localstorage 拿取 account，如果要 set 就是用 window.localStorage.setItem(key, value);
  const userAddr = window.localStorage.getItem("account");

  useEffect(() => {
    getAllNftData(userAddr);
  }, [userAddr]);

  const getAllNftData = userAddr => {
    if (!userAddr) return;
    fetch(`${OPENSEADOMAIN.TEST}/assets?owner=${userAddr}`)
      .then(res => res.json()) // call api拿到的東西沒辦法直接取用，用 json() 先轉換成json格式
      .then(res => {
        // 先console.log(res) 看我們要的assets在哪邊，再用 object.key 的方式去取 value
        const assets = res.assets;
        setData(assets);
      });
  };

  const handleOnSubmit = () => {
    // 跟合約互動的邏輯寫在父層，傳入後會在這邊執行。
    createLoan();
    // for debug: log 出來看跟輸入的是否一樣
    console.log(
      `borrowPrice: ${priceUnit} ${borrowPrice}, repaymentPrice: ${priceUnit}${repaymentPrice}, duration: ${duration}`,
    );
  };
  const verifySubmit = borrowPrice !== "" && repaymentPrice !== "" && duration !== "" && data !== null; // 控制彈窗的 ok button 能不能按

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
        {data &&
          data.map(i => (
            <MyCard data={i} active={true}>
              <Button type="primary" onClick={() => setIsModalVisible(true)}>
                Create Loan Request
              </Button>
            </MyCard>
          ))}
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

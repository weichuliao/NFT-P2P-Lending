import React from "react";
import { Select, Input } from "antd";
import "antd/dist/antd.css";

const SelectBox = ({ selectValue, title, selectOnChange, inputOnChange }) => {
  // title, onChange 從父層傳進來的
  return (
    <div className="my-2 pb-4">
      {/* 父層傳進來的 title 會被當作一個 string 用在這邊*/}
      <p>{title}</p>
      <div>
        {/* 父層傳進來的 selectOnChange 會被當作一個 function 用在這邊，也就是<Select/> 再切換option時會呼叫 selectOnChange */}
        <Select defaultValue="ETH" style={{ width: "120px" }} onChange={selectOnChange} value={selectValue}>
          {/* 先不用這個單位 <Select.Option value="wETH">wETH</Select.Option> */}
          <Select.Option value="ETH">ETH</Select.Option>
          <Select.Option value="USDT">USDT</Select.Option>
        </Select>
        <Input
          style={{ width: "50%", marginBottom: "1rem", marginLeft: "1rem" }}
          className="w-50 mx-2"
          placeholder="0"
          onChange={e => inputOnChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SelectBox;

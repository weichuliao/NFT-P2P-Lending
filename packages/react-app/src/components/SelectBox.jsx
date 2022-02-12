import React from "react";
import { Select, Input } from "antd";
import "antd/dist/antd.css";

// 目標：[React] 做一個單位選取器，知道為何要將 const [selectedValue, selectOnChange]=useState() 放在父層再傳入

const SelectBox = ({ selectedValue, title, selectOnChange, inputOnChange }) => {
  return (
    <div className="my-2 pb-4">
      <p>{title}</p>
      <div>
        <Select
          defaultValue="ETH"
          style={{ width: "120px" }}
          onChange={selectOnChange}
          // value 代表這個 <Select/> 目前選到的值。
          // 會需要 selectedValue 是因為在'src/views/MyWallet.jsx'裡用到兩個 <SelectBox/>
          // 我們希望這兩個 <SelectBox/> 的單位要一致，所以將 state 放在父層管理。
          // 父層傳拿到切換後的 ETH or USDT，再透過 selectedValue 參數傳回來。
          value={selectedValue}
        >
          <Select.Option value="ETH">ETH</Select.Option>
          <Select.Option value="USDT">USDT</Select.Option>
        </Select>
        {/* 這邊應該可以也用 <InputNumber /> */}
        <Input
          style={{ width: "50%", marginBottom: "1rem", marginLeft: "1rem" }}
          placeholder="0"
          // 因為需要拿使用者輸入的資料來跟合約互動，互動的 function 寫在父層
          // ，所以將 value 透過 inputOnChange() ，把值放在 () 裡傳出去。
          // PS e.target.value 的由來可以看 html & javascript 基礎
          onChange={e => inputOnChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SelectBox;

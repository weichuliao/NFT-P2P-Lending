import React from "react";
import { Select, InputNumber } from "antd";
import "antd/dist/antd.css";

// 目標：[React] 做一個選取器，知道為何要將 const [duration, setDuration]=useState() 放在父層再傳入

const DurationBox = ({ duration, setDuration }) => {
  return (
    <div className="my-2 pb-4">
      <p>Set Loan Duration (max 6 months)</p>
      <div>
        <Select defaultValue="month" style={{ width: 120 }}>
          <Select.Option value="month" disabled>
            month
          </Select.Option>
        </Select>
        <InputNumber
          style={{ width: "50%", marginLeft: "1rem" }}
          placeholder="1"
          // value 代表這個 <InputNumber/> 目前輸入的值。
          // 因為需要拿使用者輸入的資料來跟合約互動，而合約互動的 function 寫在父層
          // state 也在 父層管理，所以這邊的值就會是從外面傳進來的 duration
          value={duration}
          min={1}
          max={6}
          // 因為需要拿使用者輸入的資料來跟合約互動，而合約互動的 function 寫在父層
          // ，所以將資料 透過 setDuration() ，把值放在 () 裡傳出去。
          onChange={e => setDuration(e)}
        />
      </div>
    </div>
  );
};

export default DurationBox;

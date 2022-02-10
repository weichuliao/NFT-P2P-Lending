import React from "react";
import { Select, InputNumber } from "antd";
import "antd/dist/antd.css";

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
          className="w-50 mx-2"
          placeholder="1"
          value={duration}
          min={1}
          max={6}
          onChange={e => setDuration(e)}
        />
      </div>
    </div>
  );
};

export default DurationBox;

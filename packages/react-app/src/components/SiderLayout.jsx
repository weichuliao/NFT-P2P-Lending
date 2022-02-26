import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Layout, Menu, PageHeader } from "antd";
import { DesktopOutlined, PieChartOutlined } from "@ant-design/icons";
import "antd/dist/antd.css";

// 不重要

const SiderMenu = ({ extra, children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const onCollapse = collapsed => {
    setCollapsed({ collapsed });
  };
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* antd 的 Slider，只有_LOGO、MyWallet、LoanRequest是自定義的其他都 copy paste */}
      <Layout.Sider collapsible collapsed={collapsed} onCollapse={onCollapse} theme="light">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            margin: "0",
            padding: "1rem",
            alignItems: "center",
            color: "gray",
          }}
        >
          <img src="cuterDao.png" alt="logo" style={{ width: "80px" }} />
          <p>CutterDAO</p>
        </div>
        <Menu theme="light" defaultSelectedKeys={["1"]} mode="inline">
          <Menu.Item key="1" icon={<PieChartOutlined />}>
            {/* Link to={} 做的事情是 react-router-dom 的 route path 轉換 */}
            <Link to={"/"}>MyWallet</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<DesktopOutlined />}>
            <Link to={"/loan-request"}>LoanRequest</Link>
          </Menu.Item>
        </Menu>
      </Layout.Sider>
      <Layout className="site-layout">
        <PageHeader
          ghost={false}
          className="text-right text-[#343a40] bg-slate-700" // tailwind 的自定義 style
          extra={extra}
        />
        <Layout.Content style={{ margin: "16px" }}>{children}</Layout.Content>
        <Layout.Footer style={{ textAlign: "center" }}>©2022 Created by CutterDAO</Layout.Footer>
      </Layout>
    </Layout>
  );
};
export default SiderMenu;

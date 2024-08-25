"use client";
import React, { useState } from "react";
import { Layout, Menu, Typography } from "antd";
import { HomeOutlined, InfoCircleOutlined } from "@ant-design/icons";
import Profile from "../../home/profile/page";
import MyBuildings from "./mybuildings/page";
import { useAppSelector } from "@/lib/hooks";
import './profilelayout.css';  // Import the CSS file for custom styles

const { Sider, Content } = Layout;
const { Title } = Typography;

const SidebarMenu: React.FC = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState("profile");
  const user = useAppSelector((state: any) => state.auth.user);

  const renderContent = () => {
    if (user?.role === "provider") {
      switch (selectedMenuItem) {
        case "reserved":
          return <MyBuildings />;
        case "profile":
          return <Profile />;
        default:
          return <Profile />;
      }
    } else if (user?.role === "customer") {
      switch (selectedMenuItem) {
        case "slotreservation":
          return <div>Reserved</div>;
        case "profile":
          return <Profile />;
        default:
          return <Profile />;
      }
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        className="sidebar"  // Add custom class for styling
      >
        <div className="logo">
          <Title level={4} style={{ color: 'black', padding: '16px' }}>Carpark</Title>
        </div>
        <Menu
          theme="light"  // Use light theme for the menu to match white sidebar
          mode="inline"
          defaultSelectedKeys={["profile"]}
          onClick={({ key }) => setSelectedMenuItem(key)}
        >
          <Menu.Item key="profile" icon={<InfoCircleOutlined />} title="Profile">
            Profile
          </Menu.Item>
          {user?.role === "provider" ? (
            <Menu.Item key="reserved" icon={<HomeOutlined />} title="My Buildings">
              My Buildings
            </Menu.Item>
          ) : (
            <Menu.Item key="slotreservation" icon={<HomeOutlined />} title="My Reservations">
              My Reservations
            </Menu.Item>
          )}
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Content style={{ margin: "0 16px" }}>
          <div style={{ padding: 24, minHeight: 360 }}>{renderContent()}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SidebarMenu;

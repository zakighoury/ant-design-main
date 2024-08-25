"use client";
import React, { useState } from "react";
import { Layout, Menu, Dropdown, Avatar, Button } from "antd";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { authThunks } from "@/lib/features/auth/authThunks";
import {
  AppstoreOutlined,
  PlusOutlined,
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  DashboardFilled,
} from "@ant-design/icons";
import ShowBuildings from "../showbuilt/page";
import { useRouter } from "next/navigation";
import AddBuilding from "../addbuilt/page";
import ReservePage from "../reserve/page";
import Users from "../users/page";
import Dashboard from "../dashboard/page";
import "./style2.css";

const { Header, Content, Sider } = Layout;

const AdminLayout: React.FC = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>("/dashboard/admin/dashboard");
  const dispatch = useAppDispatch();
  const Router = useRouter();
  const user = useAppSelector((state: any) => state.auth.user);

  const handleMenuClick = (e: any) => {
    setSelectedMenuItem(e.key);
  };

  const handleSignOut = () => {
    dispatch(authThunks.signout());
    Router.push("/login");
  };

  if (user && user.role !== "admin") {
    return <div>Unauthorized</div>;
  }

  const profileMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<SettingOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Item key="signout" icon={<LogoutOutlined />} onClick={handleSignOut}>
        Sign Out
      </Menu.Item>
    </Menu>
  );

  const renderContent = () => {
    switch (selectedMenuItem) {
      case "/dashboard/admin/dashboard":
        return <Dashboard />;
      case "/dashboard/admin/showbuilt":
        return <ShowBuildings />;
      case "/dashboard/admin/addbuilt":
        return <AddBuilding />;
      case "/dashboard/admin/reserve":
        return <ReservePage />;
      case "/dashboard/admin/users":
        return <Users />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header className="header" style={{ background: "#001529", padding: "0 24px", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="header-left" style={{ display: "flex", alignItems: "center" }}>
          <Dropdown overlay={profileMenu} placement="bottomLeft">
            <Button
              type="text"
              style={{
                color: "#fff",
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                border: "none",
                transition: "background 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Avatar
                style={{
                  backgroundColor: "#87d068",
                  marginRight: 8,
                  border: "2px solid #fff",
                }}
                src={user?.avatar}
              />
              <span>{user?.name}</span>
            </Button>
          </Dropdown>
        </div>
        <div className="header-center" style={{ textAlign: "center" }}>
          <h1 style={{ color: "#fff", margin: 0, fontSize: "24px" }}>Admin Dashboard</h1>
        </div>
      </Header>
      <Layout style={{ flexDirection: "row" }}>
        <Sider
          width={240}
          className="site-layout-background"
          style={{
            background: "#001529",
            color: "#fff",
            padding: "16px",
            boxShadow: "2px 0 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedMenuItem]}
            style={{ height: "100%", borderRight: 0, color: "#fff" }}
            onClick={handleMenuClick}
          >
            <Menu.Item key="/dashboard/admin/dashboard" icon={<DashboardFilled style={{ fontSize: '20px' }} />} className={selectedMenuItem === "/dashboard/admin/dashboard" ? "menu-item-active" : ""}>
              Dashboard
            </Menu.Item>
            <Menu.Item key="/dashboard/admin/showbuilt" icon={<AppstoreOutlined style={{ fontSize: '20px' }} />} className={selectedMenuItem === "/dashboard/admin/showbuilt" ? "menu-item-active" : ""}>
              Show Buildings
            </Menu.Item>
            <Menu.Item key="/dashboard/admin/addbuilt" icon={<PlusOutlined style={{ fontSize: '20px' }} />} className={selectedMenuItem === "/dashboard/admin/addbuilt" ? "menu-item-active" : ""}>
              Add Building
            </Menu.Item>
            <Menu.Item key="/dashboard/admin/reserve" icon={<CalendarOutlined style={{ fontSize: '20px' }} />} className={selectedMenuItem === "/dashboard/admin/reserve" ? "menu-item-active" : ""}>
              Reservations
            </Menu.Item>
            <Menu.Item key="/dashboard/admin/users" icon={<UserOutlined style={{ fontSize: '20px' }} />} className={selectedMenuItem === "/dashboard/admin/users" ? "menu-item-active" : ""}>
              All Users
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ flex: 1 }}>
          <Content
            style={{
              padding: "24px",
              margin: "0",
              minHeight: "280px",
              background: "#fff",
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            }}
          >
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

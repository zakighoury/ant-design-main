"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Button, Drawer } from "antd";
import { MenuOutlined, UserOutlined, LoginOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";
import Image from "next/image";
import Logo from "./500_F_400093722_raPbqJUtMZlRMiCQiWp44xQG35cYO6k5-removebg-preview (2).png";
import { useAppSelector } from "@/lib/hooks";
import "./navbar.css";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const user = useAppSelector((state: any) => state.auth.user);

  useEffect(() => {
    const userToken = Cookies.get("isLoggedIn");
    setIsLoggedIn(userToken === "true");

    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Image
          src={Logo}
          className="logo1"
          alt="Car Park Logo"
          title="Car Park Logo"
        />
      </div>

      <div className="desktop-menu">
        <Menu mode="horizontal" className="menu">
          <Menu.Item key="home">
            <Link href="/">Home</Link>
          </Menu.Item>
          {user?.role === "customer" && (
            <Menu.Item key="buildings">
              <Link href="/buildings">Buildings</Link>
            </Menu.Item>
          )}
          {user?.role === "provider" && (
            <Menu.Item key="providerbuildings">
              <Link href="/providerbuilding">Buildings</Link>
            </Menu.Item>
          )}
          <Menu.Item key="about">
            <Link href="/about">About</Link>
          </Menu.Item>
          <Menu.Item key="contact">
            <Link href="/contact">Contact</Link>
          </Menu.Item>
        </Menu>
      </div>

      <div className="icons">
        {isLoggedIn ? (
          <Link className="profile" href="/home/profiellayout">
            <UserOutlined className="iconSvg" style={{ fontSize: "2.8rem" }} />
          </Link>
        ) : (
          <Link className="login" href="/login">
            <LoginOutlined />
            Sign In
          </Link>
        )}
      </div>

      <Button
        className="toggleButton"
        onClick={toggleMenu}
        icon={<MenuOutlined />}
      />

      <Drawer
        className="ham"
        title="Menu"
        placement="right"
        onClose={toggleMenu}
        open={isOpen}
        bodyStyle={{ padding: 0 }}
        style={{ color: "lawngreen" }}
      >
        <Menu mode="vertical" className="drawer-menu" onClick={toggleMenu}>
          <Menu.Item key="home">
            <Link href="/main">Home</Link>
          </Menu.Item>
          {user?.role === "customer" && (
            <Menu.Item key="buildings">
              <Link href="/buildings">Buildings</Link>
            </Menu.Item>
          )}
          {user?.role === "provider" && (
            <Menu.Item key="providerbuildings">
              <Link href="/providerbuilding">Buildings</Link>
            </Menu.Item>
          )}
          <Menu.Item key="about">
            <Link href="/about">About</Link>
          </Menu.Item>
          <Menu.Item key="contact">
            <Link href="/contact">Contact</Link>
          </Menu.Item>
          <Menu.Item key="profile">
            <Link href="/home/profiellayout">Profile</Link>
          </Menu.Item>
        </Menu>
      </Drawer>
    </nav>
  );
};

export default Header;

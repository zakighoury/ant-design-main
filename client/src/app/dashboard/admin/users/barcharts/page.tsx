"use client";
import React, { useEffect, useState } from "react";
import { message } from "antd";
import axios from "axios";
import Cookies from "js-cookie";
import { UserOutlined } from "@ant-design/icons";
import "./style1.css"; 

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const UserCharts: React.FC = () => {
  const [userCount, setUserCount] = useState<number>(0);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [inactiveCount, setInactiveCount] = useState<number>(0);
  const [roleCounts, setRoleCounts] = useState<{ admin: number; provider: number; customer: number }>({
    admin: 0,
    provider: 0,
    customer: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUsers = async () => {
    try {
      const response = await axios.get<{ users: User[] }>(
        "http://localhost:5000/api/users/admin/all",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      const users = response.data.users;
      setUserCount(users.length);

      const activeUsers = users.filter(user => user.status === "active").length;
      const inactiveUsers = users.filter(user => user.status === "disabled").length;
      setActiveCount(activeUsers);
      setInactiveCount(inactiveUsers);

      const roleCounts = users.reduce(
        (acc, user) => {
          if (user.role === "admin") acc.admin += 1;
          if (user.role === "provider") acc.provider += 1;
          if (user.role === "customer") acc.customer += 1;
          return acc;
        },
        { admin: 0, provider: 0, customer: 0 }
      );
      setRoleCounts(roleCounts);

    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <div className="user-management-container-chart">
        <h1 className="title-chart">User Statistics</h1>
        <div className="user-info">
          <UserOutlined className="user-icon" />
          <p className="user-count">Total Users: {userCount}</p>
        </div>
        <div className="user-info">
          <UserOutlined className="user-icon" />
          <p className="user-count">Active Users: {activeCount}</p>
        </div>
        <div className="user-info">
          <UserOutlined className="user-icon" />
          <p className="user-count">Disabled Users: {inactiveCount}</p>
        </div>
        <div className="user-info">
          <UserOutlined className="user-icon" />
          <p className="user-count">Admins: {roleCounts.admin}</p>
        </div>
        <div className="user-info">
          <UserOutlined className="user-icon" />
          <p className="user-count">Providers: {roleCounts.provider}</p>
        </div>
        <div className="user-info">
          <UserOutlined className="user-icon" />
          <p className="user-count">Customers: {roleCounts.customer}</p>
        </div>
      </div>
    </div>
  );
};

export default UserCharts;

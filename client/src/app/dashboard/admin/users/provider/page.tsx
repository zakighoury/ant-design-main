import React, { useEffect, useState } from "react";
import { Avatar, message } from "antd";
import axios from "axios";
import Cookies from "js-cookie";
import profile from "./images (1).png"; 
import "./provider.css"; 

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const UserCharts: React.FC = () => {
  const [userCount, setUserCount] = useState<number>(0);
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
      const providerUsers = response.data.users.filter(
        (user: User) => user.role === "provider"
      );
      setUserCount(providerUsers.length);
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
      <div className="user-management-container-chart-provider">
        <h1 className="title-chart-provider">Total Providers</h1>
        <div className="user-info-provider">
          <Avatar
            src={profile.src} 
            size={64}
          />
          <p className="user-count-provider">{userCount}</p>
        </div>
      </div>
    </div>
  );
};

export default UserCharts;

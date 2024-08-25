import React, { useEffect, useState } from "react";
import { Avatar, message } from "antd";
import { CustomerServiceFilled } from "@ant-design/icons";
import axios from "axios";
import Cookies from "js-cookie";
import customerProfile from "./avatar-icon-images-4.jpg";
import "./customer.css";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const CustomerCharts: React.FC = () => {
  const [customerCount, setCustomerCount] = useState<number>(0);
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
      const customerUsers = response.data.users.filter(
        (user: User) => user.role === "customer"
      );
      setCustomerCount(customerUsers.length);
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
      <div className="user-management-container-chart-customer">
        <h1 className="title-chart-customer">Total Customers</h1>
        <div className="user-info-customer">
          <Avatar src={customerProfile.src} size={64} />
          <p className="user-count-customer">{customerCount}</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerCharts;

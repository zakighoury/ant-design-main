"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { message } from 'antd';
import './UserStatusPage.css'; 

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const UserStatusPage: React.FC = () => {
  const [activeCount, setActiveCount] = useState<number>(0);
  const [blockedCount, setBlockedCount] = useState<number>(0);
  const [disabledCount, setDisabledCount] = useState<number>(0);

  const fetchUsers = async () => {
    try {
      const response = await axios.get<{ users: User[] }>(
        'http://localhost:5000/api/users/admin/all',
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        }
      );

      const activeUsers = response.data.users.filter((user) => user.status === 'active');
      const blockedUsers = response.data.users.filter((user) => user.status === 'blocked');
      const disabledUsers = response.data.users.filter((user) => user.status === 'disabled');

      setActiveCount(activeUsers.length);
      setBlockedCount(blockedUsers.length);
      setDisabledCount(disabledUsers.length);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to fetch user statuses.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="user-status-page">
      <h1 className="user-status-title">User Status Summary</h1>
      <div className="user-status-summary">
        <div className="status-box active-status">
          <p className="status-label">Active Users</p>
          <p className="status-count">{activeCount}</p>
        </div>
        <div className="status-box blocked-status">
          <p className="status-label">Blocked Users</p>
          <p className="status-count">{blockedCount}</p>
        </div>
        <div className="status-box disabled-status">
          <p className="status-label">Disabled Users</p>
          <p className="status-count">{disabledCount}</p>
        </div>
      </div>
    </div>
  );
};

export default UserStatusPage;

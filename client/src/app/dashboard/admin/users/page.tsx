"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Typography,
  Input as AntInput,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import Cookies from "js-cookie";
import "./UserManagementPage.css";
import dayjs from "dayjs";
const { Option } = Select;
const { Title } = Typography;

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

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
      setUsers(response.data.users);
      setFilteredUsers(response.data.users);
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

  useEffect(() => {
    if (searchText) {
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchText, users]);

  const showModal = (user: User | null) => {
    setCurrentUser(user);
    setIsModalVisible(true);
    if (user) {
      form.setFieldsValue(user);
    } else {
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = form.getFieldsValue();
      if (currentUser) {
        // Update user
        await axios.put(
          `http://localhost:5000/api/users/admin/update/${currentUser._id}`,
          values
        );
        message.success("User updated successfully!");
      } else {
        // Create user
        await axios.post("http://localhost:5000/api/users", values);
        message.success("User created successfully!");
      }
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      message.error("Failed to save user.");
    }
    setIsModalVisible(false);
  };

  const handleDelete = async (userId: string) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/users/admin/delete/${userId}`
      );
      message.success("User deleted successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error("Failed to delete user.");
    }
  };

  const columns = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      render: (avatar: string) => (
        <img className="avatar-placeholder" src={avatar} alt="Avatar" />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: any) => (
        <span>{dayjs(createdAt.$date).format("YYYY-MM-DD ddd HH:mm:ss")}</span>
      ),
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (updatedAt: any) => (
        <span>{dayjs(updatedAt.$date).format("YYYY-MM-DD ddd HH:mm:ss")}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color;
        switch (status) {
          case "active":
            color = "#52c41a";
            break;
          case "disabled":
            color = "#faad14";
            break;
          case "blocked":
            color = "#f5222d";
            break;
          default:
            color = "#d9d9d9";
        }
        return <span style={{ color, fontWeight: "bold" }}>{status}</span>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (text: string, record: User) => (
        <Space size="middle">
          <Button onClick={() => showModal(record)} type="primary" ghost>
            Edit
          </Button>
          <Button onClick={() => handleDelete(record._id)} danger>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="user-management-container">
      <Title level={2} className="title">
        User Management
      </Title>
      <div className="search-container">
        <AntInput
          placeholder="Search by name or email"
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
          allowClear
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          onClick={() => showModal(null)}
          className="add-user-button"
        >
          Add User
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          position: ["bottomCenter"],
        }}
      />
      <Modal
        title={currentUser ? "Edit User" : "Add User"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Save"
        cancelText="Cancel"
        className="user-management-modal"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[
              { required: true, message: "Please input the user's name" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Please input a valid email address",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[
              { required: true, message: "Please select the user's role" },
            ]}
          >
            <Select>
              <Option value="admin">Admin</Option>
              <Option value="provider">Provider</Option>
              <Option value="customer">Customer</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[
              { required: true, message: "Please select the user's status" },
            ]}
          >
            <Select>
              <Option value="active">Active</Option>
              <Option value="disabled">Disabled</Option>
              <Option value="blocked">Blocked</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;

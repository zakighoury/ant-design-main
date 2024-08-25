"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { Card, Avatar, Typography, Button, Spin } from "antd";
import Cookies from "js-cookie";
import { authThunks } from "../../../lib/features/auth/authThunks"; // Adjust the import path
import "./style.css"; // External CSS for styling

const { Title, Paragraph } = Typography;

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state: any) => state.auth.user);
  const loading = useAppSelector((state: any) => state.auth.loading);
  const [role, setRole] = useState("");

  useEffect(() => {
    const userRole = Cookies.get("role");
    setRole(userRole || "");
    if (
      !userRole ||
      !user ||
      (userRole !== "provider" && userRole !== "customer")
    ) {
      router.push("/login");
    }
  }, [user, router]);

  const handleSignout = () => {
    dispatch(authThunks.signout());
    router.push("/login");
    
  };

  if (loading) {
    return (
      <div className="profile-container">
        <Spin tip="Loading..." size="large" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-container">
      <Card className="profile-card">
        <Avatar
          size={120}
          src={user.avatar}
          alt="User Avatar"
          className="profile-avatar"
        />
        <Title level={2} className="profile-title">
          {user.name}
        </Title>
        <Paragraph className="profile-info">
          Email: <strong>{user.email}</strong>
        </Paragraph>
        <Paragraph className="profile-info">
          Role: <strong>{role}</strong>
        </Paragraph>
        <Button
          type="primary"
          shape="round"
          onClick={handleSignout}
          className="signout-button"
          loading={loading}
          
        >
          Sign Out
        </Button>
      </Card>
    </div>
  );
};

export default Profile;


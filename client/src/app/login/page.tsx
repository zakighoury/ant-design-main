"use client";
import { useState } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { Button, Typography, Form, Input, message } from "antd";
import { UserOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import Link from "next/link";
import { googleAuth } from "../../helpers";
import { authThunks } from "../../lib/features/auth/authThunks";
import HomeLayout from "../home/layout";
import { useRouter } from "next/navigation";
import "./style.css";

const { Title, Text } = Typography;

export default function SignInPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    email: string;
    password: string;
    role: string;
  }) => {
    setLoading(true);
    try {
      dispatch(authThunks.signin({ values, router }));
    } catch (error) {
      message.error("Sign in failed. Please try again.");
      console.error("Sign in error:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <HomeLayout>
      <div className="signin-page">
        <div className="signin-page-container">
          <div className="signin-form-container">
            <div className="signin-form">
              <Title
                level={3}
                className="signin-title"
              >
                Sign In to Your Account
              </Title>
              <div className="social-login">
                <Button
                  type="primary"
                  block
                  onClick={googleAuth}
                  className="google-btn"
                >
                  <GoogleOutlined  />
                  Sign In with Google
                </Button>
                <div className="or-divider">
                  <div className="border-line"></div>
                  <div className="or-text">Or continue with</div>
                  <div className="border-line"></div>
                </div>
              </div>
              <Form
                name="signin"
                layout="vertical"
                initialValues={{ remember: true }}
                onFinish={onFinish}
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "Please enter your email!" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Email"
                    size="large"
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "Please enter your password!" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Password"
                    size="large"
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="ant-btn-primary"
                    size="large"
                    loading={loading}
                    block
                  >
                    Sign In
                  </Button>
                </Form.Item>
                <div className="signin-footer">
                  <Text style={{ fontSize: "18px" }}>
                    Don't have an account? <Link href="/signup">Sign Up</Link>
                  </Text>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter from next/navigation
import { useAppDispatch } from "@/lib/hooks";
import { Button, Typography, Form, Input, Select, message } from "antd"; // Import Select from antd
import { Icons } from "../../components/ui/icons";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import Link from "next/link";
import { googleAuth } from "../../helpers";
import { authThunks } from "../../lib/features/auth/authThunks";
import HomeLayout from "../home/layout";
import "./style.css";

const { Title, Text } = Typography;

export default function SignUpPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // Redirect if the role is already set in cookies (You can remove this if cookies are not used)
    // const role = Cookies.get("role");
    // if (role) {
    //   router.push("/main");
    // }
  }, [router]);

  const onFinish = async (values: {
    name: string;
    email: string;
    role: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      const response = await dispatch(
        authThunks.signup({
          name: values.name,
          email: values.email,
          role: values.role,
          password: values.password,
        })
      ).unwrap();
      if (response) {
        router.push("/login");
      }
    } catch (error) {}
    setLoading(false);
  };

  return (
    <HomeLayout>
      <div className="signup-container">
        <div className="signup-content">
          <div className="signup-form">
            <div className="text-center mb-6">
              <Title
                level={3}
                className="text-2xl"
                style={{
                  fontSize: "24px",
                  textTransform: "capitalize",
                  marginBottom: "10px",
                }}
              >
                Create an Account
              </Title>
            </div>
            <div className="social-login">
              <Button
                type="primary"
                block
                onClick={googleAuth}
                className="google-btn"
                style={{ marginBottom: "30px" }}
              >
                <Icons.google className="mr-2 h-4 w-4" />
                Sign Up with Google
              </Button>
              <div className="or-divider">
                <div className="border-line"></div>
                <div className="or-text">Or continue with</div>
                <div className="border-line"></div>
              </div>
            </div>
            <Form form={form} name="signup" onFinish={onFinish}>
              <Form.Item
                name="name"
                rules={[{ required: true, message: "Please input your name!" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Name" />
              </Form.Item>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                ]}
              >
                <Input
                  type="email"
                  prefix={<MailOutlined />}
                  placeholder="Email"
                />
              </Form.Item>
              <Form.Item
                name="role"
                rules={[
                  { required: true, message: "Please select your role!" },
                ]}
              >
                <Select placeholder="Select Role">
                  <Select.Option value="provider">Provider</Select.Option>
                  <Select.Option value="customer">Customer</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                >
                  Sign Up
                </Button>
              </Form.Item>
            </Form>
            <div className="text-center">
              <Text style={{ fontSize: "18px" }}>
                Already have an account?{" "}
                <Link href="/login" className="signin-link">
                  Sign In
                </Link>
              </Text>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

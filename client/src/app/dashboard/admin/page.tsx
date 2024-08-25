// "use client";
// import React, { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Card, Form, Input, Button, Typography, Alert } from "antd";
// import { UserOutlined, LockOutlined } from "@ant-design/icons";
// import { login } from "../../../lib/features/action/authAction";
// import "./adminLoginPage.css";

// const { Title } = Typography;

// export default function AdminLoginPage() {
//   const [loading, setLoading] = useState(false);
//   const dispatch = useDispatch();
//   const error = useSelector((state) => state.auth.error);

//   const onFinish = (values) => {
//     setLoading(true);
//     dispatch(login(values.username, values.password))
//       .then(() => {
//         setLoading(false);
//       })
//       .catch(() => {
//         setLoading(false);
//       });
//   };

//   return (
//     <div className="admin-login-background">
//       <div className="admin-login-container">
//         <Card className="admin-login-card">
//           <div className="admin-login-card-header">
//             <Title level={3} className="admin-login-card-title">
//               Admin Login
//             </Title>
//           </div>
//           <Form
//             name="admin_login"
//             initialValues={{ remember: true }}
//             onFinish={onFinish}
//           >
//               <Form.Item
//                 name="username"
//                 rules={[
//                   { required: true, message: "Please input your username!" },
//                 ]}
//               >
//                 <Input
//                   prefix={<UserOutlined className="site-form-item-icon" />}
//                   placeholder="Username"
//                 />
//               </Form.Item>
//               <Form.Item
//                 name="password"
//                 rules={[{ required: true, message: "Please input your Password!" }]}
//               >
//                 <Input.Password
//                   prefix={<LockOutlined className="site-form-item-icon" />}
//                   type="password"
//                   placeholder="Password"
//                 />
//               </Form.Item>
//               <Form.Item>
//                 <Button
//                   type="primary"
//                   htmlType="submit"
//                   className="admin-login-form-button"
//                   loading={loading}
//                 >
//                   Login
//                 </Button>
//               </Form.Item>
//               {error && (
//                 <Form.Item>
//                   <Alert message={error} type="error" showIcon />
//                 </Form.Item>
//               )}
//           </Form>
//         </Card>
//       </div>
//     </div>
//   );
// }

"use client";
import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  Table,
} from "antd";
import { UserOutlined, CalendarOutlined, CarOutlined } from "@ant-design/icons";
import { Chart } from "react-google-charts";
import axios from "axios";
import Cookies from "js-cookie";
import { message } from "antd";

const { Title } = Typography;
const { Header, Content } = Layout;

const Dashboard: React.FC = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const token = Cookies.get("token");
      const role = Cookies.get("role");
      const response = await axios.get(
        "http://localhost:5000/admin/api/buildings/data/slots",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-User-Role": role || "",
          },
        }
      );

      const fetchedSlots = response.data.slots;
      setSlots(fetchedSlots);
      calculateStats(fetchedSlots);
    } catch (error) {
      console.error("Error fetching slots:", error);
      message.error("Failed to fetch parking slots.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (slots: any[]) => {
    // Calculate statistics such as total, reserved, and available spots
    const totalSpots = slots.length;
    const reservedSpots = slots.filter(
      (slot) => slot.reservations.length > 0
    ).length;
    const availableSpots = totalSpots - reservedSpots;

    // Set these statistics in the state or use them directly in the component
  };

  const popularSpots = slots.reduce((acc: any[], slot) => {
    return acc
      .concat(slot.reservations.length)
      .sort((a, b) => b - a)
      .slice(0, 5);
  }, []);

  const spotStatus = slots.slice(0, 2).map((slot) => ({
    name: `Building ${slot.buildingId} Floor ${slot.floorNumber} Slot ${slot.slotNumber}`,
    status: slot.reservations.length > 0 ? "Reserved" : "Available",
  }));

  const sortedSpots = popularSpots
    .map((spotCount, index) => ({
      name: `Building ${slots[index].buildingId} Floor ${slots[index].floorNumber} Slot ${slots[index].slotNumber}`,
      count: spotCount,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const reservedSlots = slots.filter(
    (slot) => slot.reservations && slot.reservations.length > 0
  ).length;

  const chartData = [
    ["Month", "Reserved Spots", "Available Spots"],
    ["Jan", 10, 30],
    ["Feb", 20, 40],
    ["Mar", 15, 35],
    ["Apr", 30, 50],
    ["May", 25, 45],
    ["Jun", 20, 40],
    ["Jul", 15, 35],
    ["Aug", 10, 30],
    ["Sep", 5, 25],
    ["Oct", 10, 30],
    ["Nov", 15, 35],
    ["Dec", 20, 40],
  ];

  const chartOptions = {
    chart: {
      title: "Reservations Overview",
    },
    colors: ["#FF6384", "#36A2EB"],
    legend: { position: "top" },
  };

  return (
    <Layout>
      <Header>
        <Title
          level={2}
          style={{
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "8px",
          }}
        >
          Parking Slots Overview
        </Title>
      </Header>
      <Content style={{ padding: "20px", backgroundColor: "#f0f2f5" }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total Spots"
                value={slots.length}
                prefix={<CarOutlined />}
                style={{ textAlign: "center" }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Reserved Spots"
                value={reservedSlots}
                prefix={<CalendarOutlined />}
                style={{ textAlign: "center" }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Available Spots"
                value={
                  spotStatus.filter((spot) => spot.status === "Available")
                    .length
                }
                prefix={<UserOutlined />}
                style={{ textAlign: "center" }}
              />
            </Card>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: "20px" }}>
          <Col span={12}>
            <Card title="Popular Spots">
              {sortedSpots.map((spot) => (
                <Tag key={spot.name} color="blue">
                  {spot.name}: {spot.count} Reservations
                </Tag>
              ))}
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Spot Status">
              <Table
                dataSource={spotStatus}
                columns={[
                  { title: "Spot Name", dataIndex: "name", key: "name" },
                  { title: "Status", dataIndex: "status", key: "status" },
                ]}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: "20px" }}>
          <Col span={24}>
            <Card title="Reservations Overview">
              <Chart
                chartType="Bar"
                width="100%"
                height="400px"
                data={chartData}
                options={chartOptions}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Dashboard;

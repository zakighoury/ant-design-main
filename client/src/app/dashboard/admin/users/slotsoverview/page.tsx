import React, { useEffect, useState } from "react";
import { Typography, Spin, message, Card, Row, Col, Statistic } from "antd";
import axios from "axios";
import Cookies from "js-cookie";
import "./parking.css";

const { Title } = Typography;

interface ParkingSlot {
  buildingId: string;
  buildingName: string;
  floorNumber: number;
  slotNumber: number;
  reservations?: any[];
}

const ParkingOverviewPage: React.FC = () => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSlots: 0,
    reservedSlots: 0,
    availableSlots: 0
  });

  // Function to fetch parking slots from the backend
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

  // Function to calculate statistics from the fetched slots
  const calculateStats = (slots: ParkingSlot[]) => {
    const totalSlots = slots.length;
    const reservedSlots = slots.filter(slot => slot.reservations && slot.reservations.length > 0).length;
    const availableSlots = totalSlots - reservedSlots;

    setStats({
      totalSlots,
      reservedSlots,
      availableSlots
    });
  };

  // Fetch slots on component mount
  useEffect(() => {
    fetchSlots();
  }, []);

  // Render loading state or content
  if (loading) {
    return (
      <div className="spin-container">
        <Spin tip="Loading..." />
      </div>
    );
  }

  return (
    <div className="overview-container">
      <Title level={2} className="title">Parking Slots Overview</Title>
      <Row gutter={16}>
        <Col span={8}>
          <Card bordered={false} className="stat-card">
            <Statistic title="Total Slots" value={stats.totalSlots} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="stat-card">
            <Statistic title="Reserved Slots" value={stats.reservedSlots} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="stat-card">
            <Statistic title="Available Slots" value={stats.availableSlots} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ParkingOverviewPage;

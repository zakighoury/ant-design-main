"use client";
import React, { useEffect, useState } from "react";
import { List, Typography, Spin, message, Button, Card, Collapse, Tooltip, Modal } from "antd";
import axios from "axios";
import Cookies from "js-cookie";
import { InfoCircleOutlined } from '@ant-design/icons';
import "./SlotManagementPage.css";

const { Title } = Typography;
const { Panel } = Collapse;

interface Reservation {
  reservedBy: string;
  reservedByName: string;
  reservationStartTime: string;
  reservationEndTime: string;
  vehicleType: string;
}

interface Slot {
  buildingId: string;
  buildingName: string;
  floorNumber: number;
  slotNumber: number;
  reservations?: Reservation[];
}

const SlotManagementPage: React.FC = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

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
      console.log("Slots fetched successfully:", response.data);
      setSlots(response.data.slots);
      console.log("Slots set:", slots);
    } catch (error) {
      console.error("Error fetching slots:", error);
      message.error("Failed to fetch slots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleViewDetails = (slot: Slot) => {
    setSelectedSlot(slot);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedSlot(null);
  };

  if (loading) {
    return (
      <div className="spin-container">
        <Spin tip="Loading..." />
      </div>
    );
  }

  return (
    <div className="container">
      <Title level={2} className="title">Slot Management</Title>
      <List
        itemLayout="vertical"
        size="large"
        dataSource={slots}
        renderItem={(slot) => (
          <List.Item
            key={slot.slotNumber}
            className={`slot-item ${slot.reservations && slot.reservations.length > 0 ? 'reserved' : 'available'}`}
          >
            <Card
              title={`Building: ${slot.buildingId} - Floor: ${slot.floorNumber} - Slot: ${slot.slotNumber}`}
              bordered={true}
              className="slot-card"
              extra={
                <Tooltip title="View Details">
                  <Button
                    type="link"
                    icon={<InfoCircleOutlined />}
                    onClick={() => handleViewDetails(slot)}
                  />
                </Tooltip>
              }
            >
              <div className={`status-indicator ${slot.reservations && slot.reservations.length > 0 ? 'reserved' : 'available'}`}>
                {slot.reservations && slot.reservations.length > 0 ? 'Reserved' : 'Available'}
              </div>
              <Collapse>
                <Panel header="Details" key="1">
                  <div className="slot-info">
                    {slot.reservations && slot.reservations.length > 0 ? (
                      <>
                        <p><strong>Reserved By:</strong> {slot.reservations[0].reservedByName}</p>
                        <p><strong>ID:</strong> {slot.reservations[0].reservedBy}</p>
                        <p><strong>Vehicle Type:</strong> {slot.reservations[0].vehicleType}</p>
                        <p><strong>From:</strong> {new Date(slot.reservations[0].reservationStartTime).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}</p>
                        <p><strong>To:</strong> {new Date(slot.reservations[0].reservationEndTime).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}</p>
                      </>
                    ) : (
                      <p>Status: <span className="available-text">Available</span></p>
                    )}
                  </div>
                </Panel>
              </Collapse>
            </Card>
          </List.Item>
        )}
      />
      <Modal
        title="Slot Details"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        className="slot-details-modal"
      >
        {selectedSlot && (
          <div className="slot-info">
            <p><strong>Building:</strong> {selectedSlot.buildingId}</p>
            <p><strong>Floor:</strong> {selectedSlot.floorNumber}</p>
            <p><strong>Slot:</strong> {selectedSlot.slotNumber}</p>
            {selectedSlot.reservations && selectedSlot.reservations.length > 0 ? (
              <>
                <p><strong>Reserved By:</strong> {selectedSlot.reservations[0].reservedByName}</p>
                <p><strong>ID:</strong> {selectedSlot.reservations[0].reservedBy}</p>
                <p><strong>Vehicle Type:</strong> {selectedSlot.reservations[0].vehicleType}</p>
                <p><strong>From:</strong> {new Date(selectedSlot.reservations[0].reservationStartTime).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}</p>
                <p><strong>To:</strong> {new Date(selectedSlot.reservations[0].reservationEndTime).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}</p>
              </>
            ) : (
              <p>Status: <span className="available-text">Available</span></p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SlotManagementPage;

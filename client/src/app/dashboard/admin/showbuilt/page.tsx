"use client";
import React, { useEffect, useState } from "react";
import {
  Collapse,
  Modal,
  Button,
  Input,
  Form,
  Row,
  Col,
  Typography,
  Spin,
  message,
  List,
} from "antd";
import axios from "axios";
import Cookies from "js-cookie";
import Image from "next/image";
const { Panel } = Collapse;
const { Title } = Typography;

interface Slot {
  number: number;
  isAvailable: boolean;
  reservations?: any[];
}

interface Floor {
  number: number;
  slots: Slot[];
}

interface Building {
  ImgUrl: string;
  name: string;
  address: string;
  floors: Floor[];
  description: string;
  isBought?: boolean;
  boughtByName?: string;
  _id: string;
}

const BuildingManagementPage: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBuildingModalVisible, setIsBuildingModalVisible] = useState(false);
  const [isFloorModalVisible, setIsFloorModalVisible] = useState(false);
  const [isSlotModalVisible, setIsSlotModalVisible] = useState(false);
  const [currentBuilding, setCurrentBuilding] = useState<Building | null>(null);
  const [currentFloor, setCurrentFloor] = useState<Floor | null>(null);
  const [currentSlot, setCurrentSlot] = useState<Slot | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchBuildings = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const role = Cookies.get("role");
      const response = await axios.get(
        "http://localhost:5000/admin/api/buildings/data/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-User-Role": role || "",
          },
        }
      );
      console.log("Buildings fetched successfully:", response.data);
      setBuildings(response.data.buildings);
    } catch (error) {
      console.error("Error fetching buildings:", error);
      message.error("Failed to fetch buildings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const getAuthHeaders = () => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");
    return {
      Authorization: `Bearer ${token}`,
      "X-User-Role": role || "",
    };
  };

  const showBuildingModal = (building: Building) => {
    setCurrentBuilding(building);
    setIsBuildingModalVisible(true);
    form.setFieldsValue(building);
  };

  const showFloorModal = (building: Building, floor: Floor) => {
    setCurrentBuilding(building);
    setCurrentFloor(floor);
    setIsFloorModalVisible(true);
    form.setFieldsValue(floor);
  };

  const showSlotModal = (building: Building, floor: Floor, slot: Slot) => {
    setCurrentBuilding(building);
    setCurrentFloor(floor);
    setCurrentSlot(slot);
    setIsSlotModalVisible(true);
    form.setFieldsValue(slot);
  };

  const handleCancel = () => {
    setIsBuildingModalVisible(false);
    setIsFloorModalVisible(false);
    setIsSlotModalVisible(false);
    form.resetFields();
  };

  const handleBuildingOk = async () => {
    setSubmitting(true);
    try {
      const values = form.getFieldsValue();
      await axios.put(
        `http://localhost:5000/admin/api/buildings/${currentBuilding?._id}`,
        values,
        {
          headers: getAuthHeaders(),
        }
      );
      fetchBuildings();
      message.success("Building updated successfully!");
    } catch (error) {
      console.error("Error updating building:", error);
      message.error("Failed to update building.");
    }
    setIsBuildingModalVisible(false);
    setSubmitting(false);
  };

  const handleFloorOk = async () => {
    setSubmitting(true);
    try {
      const values = form.getFieldsValue();
      await axios.put(
        `http://localhost:5000/admin/api/buildings/${currentBuilding?._id}/floors/${currentFloor?.number}`,
        values,
        {
          headers: getAuthHeaders(),
        }
      );
      fetchBuildings();
      message.success("Floor updated successfully!");
    } catch (error) {
      console.error("Error updating floor:", error);
      message.error("Failed to update floor.");
    }
    setIsFloorModalVisible(false);
    setSubmitting(false);
  };

  const handleSlotOk = async () => {
    setSubmitting(true);
    try {
      const values = form.getFieldsValue();
      await axios.put(
        `http://localhost:5000/admin/api/buildings/${currentBuilding?._id}/floors/${currentFloor?.number}/slots/${currentSlot?.number}`,
        values,
        {
          headers: getAuthHeaders(),
        }
      );
      fetchBuildings();
      message.success("Slot updated successfully!");
    } catch (error) {
      console.error("Error updating slot:", error);
      message.error("Failed to update slot.");
    }
    setIsSlotModalVisible(false);
    setSubmitting(false);
  };

  const confirmDelete = (action: () => void, type: string) => {
    Modal.confirm({
      title: `Are you sure you want to delete this ${type}?`,
      content: `This action will permanently delete this ${type}.`,
      onOk: action,
      okText: "Yes",
      cancelText: "No",
    });
  };

  const handleDeleteBuilding = async (buildingId: string) => {
    confirmDelete(async () => {
      try {
        await axios.delete(
          `http://localhost:5000/admin/api/buildings/${buildingId}`,
          {
            headers: getAuthHeaders(),
          }
        );
        fetchBuildings();
        message.success("Building deleted successfully!");
      } catch (error) {
        console.error("Error deleting building:", error);
        message.error("Failed to delete building.");
      }
    }, "building");
  };

  const handleDeleteFloor = async (buildingId: string, floorNumber: number) => {
    confirmDelete(async () => {
      try {
        await axios.delete(
          `http://localhost:5000/admin/api/buildings/${buildingId}/floors/${floorNumber}`,
          {
            headers: getAuthHeaders(),
          }
        );
        fetchBuildings();
        message.success("Floor deleted successfully!");
      } catch (error) {
        console.error("Error deleting floor:", error);
        message.error("Failed to delete floor.");
      }
    }, "floor");
  };

  const handleDeleteSlot = async (
    buildingId: string,
    floorNumber: number,
    slotNumber: number
  ) => {
    confirmDelete(async () => {
      try {
        await axios.delete(
          `http://localhost:5000/admin/api/buildings/${buildingId}/floors/${floorNumber}/slots/${slotNumber}`,
          {
            headers: getAuthHeaders(),
          }
        );
        fetchBuildings();
        message.success("Slot deleted successfully!");
      } catch (error) {
        console.error("Error deleting slot:", error);
        message.error("Failed to delete slot.");
      }
    }, "slot");
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin tip="Loading..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Building Management</Title>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={buildings}
        renderItem={(building) => {
          let canBeDeleted = true;
          for (const floor of building.floors) {
            if (!Array.isArray(floor.slots)) {
              continue;
            }
            for (const slot of floor.slots) {
              if (slot.reservations && slot.reservations.length > 0) {
                canBeDeleted = false;
                break;
              }
            }
            if (!canBeDeleted) break;
          }
          return (
            <List.Item key={building._id}>
              <Collapse accordion>
                <Panel header={building.name} key={building._id}>
                  <Image
                    src={building.ImgUrl}
                    alt={building.name}
                    style={{ width: "100%" }}
                  />
                  <p>{building.address}</p>
                  <p>{building.description}</p>
                  <p>Buyer: {building.boughtByName || "Not bought yet"}</p>
                  <Button
                    type="primary"
                    onClick={() => showBuildingModal(building)}
                  >
                    Edit Building
                  </Button>
                  <Button
                    type="default"
                    danger
                    onClick={() => handleDeleteBuilding(building._id)}
                    disabled={!canBeDeleted}
                  >
                    Delete Building
                  </Button>
                  {building.floors.map((floor) => (
                    <Collapse key={floor.number}>
                      <Panel key={floor.number} header={`Floor ${floor.number}`}>
                        <Button
                          type="primary"
                          onClick={() => showFloorModal(building, floor)}
                        >
                          Edit Floor
                        </Button>
                        <Button
                          type="default"
                          danger
                          onClick={() =>
                            handleDeleteFloor(building._id, floor.number)
                          }
                        >
                          Delete Floor
                        </Button>
                        {floor.slots.map((slot) => (
                          <div key={slot.number}>
                            <p>Slot {slot.number} - {slot.isAvailable ? "Available" : "Reserved"}</p>
                            <Button
                              type="primary"
                              onClick={() => showSlotModal(building, floor, slot)}
                            >
                              Edit Slot
                            </Button>
                            <Button
                              type="default"
                              danger
                              onClick={() =>
                                handleDeleteSlot(
                                  building._id,
                                  floor.number,
                                  slot.number
                                )
                              }
                            >
                              Delete Slot
                            </Button>
                          </div>
                        ))}
                      </Panel>
                    </Collapse>
                  ))}
                </Panel>
              </Collapse>
            </List.Item>
          );
        }}
      />
      <Modal
        title="Edit Building"
        visible={isBuildingModalVisible}
        onOk={handleBuildingOk}
        onCancel={handleCancel}
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="ImgUrl" label="Image URL" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Edit Floor"
        visible={isFloorModalVisible}
        onOk={handleFloorOk}
        onCancel={handleCancel}
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="number" label="Floor Number" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="slots" label="Slots">
            {/* Add slot editing logic here if needed */}
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Edit Slot"
        visible={isSlotModalVisible}
        onOk={handleSlotOk}
        onCancel={handleCancel}
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="number" label="Slot Number" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="isAvailable" label="Available">
            <Input type="checkbox" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BuildingManagementPage;

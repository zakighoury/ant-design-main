"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  notification,
  DatePicker,
  Divider,
  Collapse,
} from "antd";
import {
  EnvironmentOutlined,
  HomeOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import HomeLayout from "../../../home/layout";
import {
  fetchBuildingDetails,
  cancelReservation,
  reserveSlot,
} from "../../../../lib/features/auth/buildingDetailsSlice";
import { socket } from "../../../socket";
import dayjs, { Dayjs } from "dayjs";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import Image from "next/image";
import "../buildingdetail.css";
const { Title, Paragraph } = Typography;
const { Panel } = Collapse;


interface Building {
  _id: string;
  name: string;
  address: string;
  description: string;
  ImgUrl: string;
  price: number;
  isBought: boolean;
  boughtBy?: string;
  floors: Floor[];
  feedback: any[];
}

interface Floor {
  number: number;
  slots: Slot[];
  isBought: boolean;
}

interface Slot {
  number: number;
  isAvailable: boolean;
  isReserved: boolean;
  reservationStartTime?: string;
  reservationEndTime?: string;
  reservations: Reservation[];
  reservedBy?: string;
  vehicleType?: string;
}

interface Reservation {
  price: number;
  reservationStartTime: string;
  reservationEndTime: string;
  vehicleType: string;
  reservedByName?: string;
  reservedBy: {
    name: string;
  };
}

const BuildingDetails = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const dispatch = useAppDispatch();
  const building = useAppSelector(
    (state) => state.buildingDetails.building
  ) as Building;
  const [isReserveModalVisible, setIsReserveModalVisible] = useState(false);
  const [isReservationDetailsVisible, setIsReservationDetailsVisible] =
    useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    floorNumber: number;
    slotNumber: number;
  } | null>(null);
  const [reservationDetails, setReservationDetails] = useState<
    Reservation[] | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (id) {
      dispatch(fetchBuildingDetails(id));
    }
  }, [dispatch, id]);

  const handleModalClose = () => {
    setIsReserveModalVisible(false);
    setSelectedSlot(null);
    setReservationDetails(null);
    setIsSubmitting(false);
  };

  const handleShowReserveModal = (floorNumber: number, slotNumber: number) => {
    setSelectedSlot({ floorNumber, slotNumber });
    setIsReserveModalVisible(true);
  };

  const handleShowReservationDetails = (
    floorNumber: number,
    slotNumber: number
  ) => {
    setSelectedSlot({ floorNumber, slotNumber });
    setIsReservationDetailsVisible(true);

    const floor = building.floors.find((f) => f.number === floorNumber);
    const slot = floor?.slots.find((s) => s.number === slotNumber);
    if (slot) {
      setReservationDetails(slot.reservations);
    }
  };

  const handleConfirmReserveSlot = async (values: {
    reservationStartDateTime: Dayjs;
    reservationEndDateTime: Dayjs;
    vehicleType: string;
    price: number;
  }) => {
    if (selectedSlot) {
      const reservationStartDateTime =
        values.reservationStartDateTime.format("YYYY-MM-DD hh:mm A");
      const reservationEndDateTime =
        values.reservationEndDateTime.format("YYYY-MM-DD hh:mm A");
      setIsSubmitting(true);
      try {
        await dispatch(
          reserveSlot({
            id,
            floorNumber: selectedSlot.floorNumber,
            slotNumber: selectedSlot.slotNumber,
            reservationStartTime: reservationStartDateTime,
            reservationEndTime: reservationEndDateTime,
            vehicleType: values.vehicleType,
            price: values.price,
          })
        );

        socket.emit("reserveSlot", {
          id,
          floorNumber: selectedSlot.floorNumber,
          slotNumber: selectedSlot.slotNumber,
          reservationStartTime: reservationStartDateTime,
          reservationEndTime: reservationEndDateTime,
          vehicleType: values.vehicleType,
        });

        dispatch(fetchBuildingDetails(id));

        const floor = building.floors.find(
          (f) => f.number === selectedSlot.floorNumber
        );
        const slot = floor?.slots.find(
          (s) => s.number === selectedSlot.slotNumber
        );
        if (slot) {
          setReservationDetails(slot.reservations);
        }

        // notification.success({
        //   message: "Reservation Confirmed",
        //   description: `Your reservation for Floor ${selectedSlot.floorNumber}, Slot ${selectedSlot.slotNumber} is confirmed from ${reservationStartDateTime} to ${reservationEndDateTime}.`,
        // });
      } catch (error) {
        // notification.error({
        //   message: "Error",
        //   description: "Failed to reserve slot.",
        // });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancelReservation = async (reservationIndex: number) => {
    if (selectedSlot) {
      try {
        await dispatch(
          cancelReservation({
            id,
            floorNumber: selectedSlot.floorNumber,
            slotNumber: selectedSlot.slotNumber,
            reservationIndex,
            vehicleType: reservationDetails![reservationIndex].vehicleType,
          })
        );
        dispatch(fetchBuildingDetails(id));
        // notification.info({
        //   message: "Reservation Cancelled",
        //   description: `Reservation for Floor ${selectedSlot.floorNumber}, Slot ${selectedSlot.slotNumber} has been cancelled.`,
        // });
      } catch (error) {
        // notification.error({
        //   message: "Error",
        //   description: "Failed to cancel reservation.",
        // });
      }
    }
  };

  const renderSlots = () => {
    if (!building || !building.floors) return null;

    return building.floors.map((floor: Floor, floorIndex: number) => (
      <Panel
        header={
          <div className="custom-panel-header">{`Floor ${floor.number}`}</div>
        }
        key={floorIndex}
      >
        {floor.slots.map((slot: Slot, slotIndex: number) => {
          const isAvailable = slot.isAvailable && !slot.isReserved;

          return (
            <div key={slotIndex} style={{ marginBottom: "8px" }}>
              <Tag
                color={isAvailable ? "green" : "red"}
                style={{
                  padding: "12px 44px",
                  marginRight: "8px",
                  fontSize: "18px",
                  letterSpacing: "3px",
                }}
                className="cursor-pointer"
                onClick={() => {
                  if (user.role === "customer" && isAvailable) {
                    handleShowReserveModal(floor.number, slot.number);
                  }
                }}
              >
                {`Slot ${slot.number}`}
              </Tag>
              <Button
                type="link"
                danger
                style={{ fontSize: "16px" }}
                onClick={() =>
                  handleShowReservationDetails(floor.number, slot.number)
                }
              >
                View Reservation Details
              </Button>
            </div>
          );
        })}
      </Panel>
    ));
  };

  const renderReservationDetails = () => {
    if (!selectedSlot || !reservationDetails) return null;

    return (
      <Modal
        title="Reservation Details"
        open={isReservationDetailsVisible}
        onCancel={() => setIsReservationDetailsVisible(false)}
        footer={null}
        centered
      >
        {reservationDetails.length === 0 ? (
          <p>No reservations found for this slot.</p>
        ) : (
          reservationDetails.map((details, index) => (
            <div key={index} style={{ marginBottom: "16px" }}>
              {user.role === "customer" && user._id === details.reservedBy && (
                <>
                  <strong>Start Time:</strong>{" "}
                  {new Date(details.reservationStartTime).toLocaleString()}
                  <br />
                  <strong>End Time:</strong>{" "}
                  {new Date(details.reservationEndTime).toLocaleString()}
                  <br />
                  <strong>Vehicle Type:</strong> {details.vehicleType}
                  <br />
                  <strong>Reserved By:</strong> {details.reservedByName}
                  <br />
                  <Button
                    type="primary"
                    danger
                    onClick={() => handleCancelReservation(index)}
                  >
                    Cancel Reservation
                  </Button>
                </>
              )}
              <Divider />
            </div>
          ))
        )}
      </Modal>
    );
  };

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf("day");
  };

  const disabledTime = (current: Dayjs) => {
    const now = dayjs();
    if (current.isSame(now, "day")) {
      const hours = now.hour();
      const minutes = now.minute();
      return {
        disabledHours: () => Array.from({ length: hours }, (_, i) => i),
        disabledMinutes: (hour: number) =>
          hour === hours ? Array.from({ length: minutes }, (_, i) => i) : [],
      };
    }
    return {};
  };

  return (
    <HomeLayout>
      <div style={{ padding: "24px" }}>
        {building ? (
          <Card
            cover={
              <Image
                alt={building.name}
                src={building.ImgUrl}
                style={{ maxHeight: "300px", objectFit: "fill" }}
                className="building-cover-img"
              />
            }
            className="building-details-card"
          >
            <Title className="building-title" level={2}>
              <HomeOutlined />
              &nbsp;
              {building.name}
            </Title>
            <Paragraph
              style={{ textAlign: "left" }}
              className="building-address"
            >
              <EnvironmentOutlined />
              &nbsp;{building.address.split(" ").slice(0, 6).join(" ")}...
            </Paragraph>
            {/* <Paragraph className="building-description">
              {building.description}
            </Paragraph> */}
            {/* <Paragraph className="building-price">
              Price: ${building.price}
            </Paragraph> */}
            {user.role === "provider" && (
              <Button
                type="primary"
                onClick={() => handleModalClose()}
                style={{ marginBottom: "16px" }}
                className="leave-building-button"
              >
                Leave Building
              </Button>
            )}
            <Collapse className="building-slots-collapse">
              {renderSlots()}
            </Collapse>
          </Card>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <Modal
        title="Reserve Slot"
        open={isReserveModalVisible}
        onCancel={handleModalClose}
        footer={null}
        centered
      >
        <Form onFinish={handleConfirmReserveSlot}>
          <Form.Item
            name="reservationStartDateTime"
            label="Reservation Start Time"
            rules={[{ required: true, message: "Please select start time!" }]}
          >
            <DatePicker
              showTime={{ format: "hh:mm A" }}
              format="YYYY-MM-DD hh:mm A"
              disabledDate={disabledDate}
              disabledTime={disabledTime}
            />
          </Form.Item>
          <Form.Item
            name="reservationEndDateTime"
            label="Reservation End Time"
            rules={[{ required: true, message: "Please select end time!" }]}
          >
            <DatePicker
              showTime={{ format: "hh:mm A" }}
              format="YYYY-MM-DD hh:mm A"
              disabledDate={disabledDate}
              disabledTime={disabledTime}
            />
          </Form.Item>
          <Form.Item
            name="vehicleType"
            label="Vehicle Type"
            rules={[{ required: true, message: "Please enter vehicle type!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Reserve Slot
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {renderReservationDetails()}
    </HomeLayout>
  );
};

export default BuildingDetails;

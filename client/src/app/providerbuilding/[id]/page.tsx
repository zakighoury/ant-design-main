"use client";
import React, { useEffect, useState } from "react";
import {
  Layout,
  Modal,
  Button,
  Form,
  Input,
  Typography,
  message,
  Tag,
} from "antd";
import {
  fetchBuildingDetails,
  buyBuilding,
  leaveBuilding,
} from "../../../lib/features/auth/buildingDetailsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { buildingThunks } from "@/lib/features/buildings/buildingThunks";
import HomeLayout from "../../home/layout";
import "./BuildingDetails.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
const { Content } = Layout;
const { Title, Paragraph } = Typography;

interface Reservation {
  _id: string;
  reservationStartTime: string;
  reservationEndTime: string;
  vehicleType: string;
  reservedBy: string;
  reservedByName: string;
  cancelReason?: string;
}

interface Slot {
  number: number;
  isAvailable: boolean;
  reservedByUser?: boolean;
  reservations?: Reservation[];
}

interface Floor {
  number: number;
  slots: Slot[];
}

interface Building {
  name: string;
  address: string;
  description: string;
  ImgUrl: string;
  floors: Floor[];
  price: number;
  isBought: boolean;
}

interface User {
  role: string;
  id: string;
}

const BuildingDetails = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const dispatch = useAppDispatch();
  const building = useAppSelector(
    (state) => state.buildings.singleBuilding
  ) as Building;
  const [isBuyBuildingModalVisible, setIsBuyBuildingModalVisible] =
    useState(false);
  const [isLeaveBuildingModalVisible, setIsLeaveBuildingModalVisible] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReservationModalVisible, setIsReservationModalVisible] =
    useState(false);
  const [isCancelReservationModalVisible, setIsCancelReservationModalVisible] =
    useState(false);
  const [cancellationReason, setCancellationReason] = useState<string>("");
  const [selectedSlotReservations, setSelectedSlotReservations] = useState<
    Reservation[]
  >([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(
    null
  );
  const { user } = useAppSelector((state) => state.auth) as { user: User };

  useEffect(() => {
    if (id) {
      dispatch(buildingThunks.fetchBuildingDetails({ id }));
    }
  }, [dispatch, id]);

  const handleModalClose = () => {
    setIsBuyBuildingModalVisible(false);
    setIsLeaveBuildingModalVisible(false);
    setIsReservationModalVisible(false);
    setIsCancelReservationModalVisible(false);
    setCancellationReason("");
    setIsSubmitting(false);
  };

  const handleBuyBuilding = () => {
    setIsBuyBuildingModalVisible(true);
  };

  const handleConfirmBuyBuilding = async (values: any) => {
    setIsSubmitting(true);
    try {
      await dispatch(
        buyBuilding({
          id,
          providerName: values.providerName,
          phoneNumber: values.phoneNumber,
          cardDetails: values.cardDetails,
          providerEmail: values.providerEmail,
          price: building.price,
        })
      );
      await dispatch(fetchBuildingDetails(id));
      message.success("Building bought successfully.");
    } catch (error) {
      message.error("Failed to buy building.");
    } finally {
      handleModalClose();
    }
  };

  const handleLeaveBuilding = () => {
    setIsLeaveBuildingModalVisible(true);
  };

  const handleConfirmLeaveBuilding = async (values: any) => {
    setIsSubmitting(true);
    try {
      await dispatch(leaveBuilding({ id, leaveReason: values.leaveReason }));
      await dispatch(fetchBuildingDetails(id));
      message.success("Building left successfully.");
    } catch (error) {
      message.error("Failed to leave building.");
    } finally {
      handleModalClose();
    }
  };

  const handleCancelReservation = (reservationId: string) => {
    setSelectedSlotReservations((prevReservations) =>
      prevReservations.filter((res) => res._id !== reservationId)
    );
    setIsCancelReservationModalVisible(true);
  };

  const handleConfirmCancelReservation = async (values: any) => {
    if (!values.cancellationReason) {
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(
        buildingThunks.cancelReservation({
          reservationId: selectedSlotReservations.find(
            (res) => null !== res._id
          )!._id,
          cancelReason: values.cancellationReason,
        })
      );
      message.success("Reservation canceled successfully.");
      setSelectedSlotReservations((prevReservations) =>
        prevReservations.filter((res) => null !== res._id)
      );
    } catch (error) {
      console.error("Error canceling reservation:", error);
      message.error("Failed to cancel reservation.");
    } finally {
      handleModalClose();
    }
  };

  const handleSlotClick = (
    slot: Slot,
    floorIndex: number,
    slotIndex: number
  ) => {
    setSelectedSlotReservations(slot.reservations || []);
    setSelectedSlotIndex(slotIndex);
    setIsReservationModalVisible(true);
  };

  const renderSlots = () => {
    if (!building || !building.floors) return null;

    return building.floors.map((floor, floorIndex) => (
      <div key={floorIndex} className="floor-container">
        <Title level={4} className="floor-title">
          Floor {floor.number}
        </Title>
        <div className="slot-row">
          {floor.slots.map((slot, slotIndex) => (
            <Tag
              key={slotIndex}
              className={`slot-tag ${
                slot.isAvailable ? "available" : "reserved"
              }`}
              onClick={() => handleSlotClick(slot, floorIndex, slotIndex)}
            >
              {`Slot ${slot.number}`}
            </Tag>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <HomeLayout>
      <Layout>
        <Content className="site-layout-background">
          <div className="building-image-container">
            <img
              className="building-image"
              src={building.ImgUrl}
              alt="Building"
              style={{ width: "738px", height: "800px", objectFit: "fill" }}
            />
          </div>
          <div>
            <div className="slot-list">
              <Title className="building-title" level={1}>
                {building.name}
              </Title>
              <Paragraph className="price">
                <strong>Price:</strong> ${building.price}
              </Paragraph>
              <Paragraph className="address">{building.address}</Paragraph>
              <div>{renderSlots()}</div>
            </div>
            {!building.isBought && user.role === "provider" && (
              <Button
                type="primary"
                onClick={handleBuyBuilding}
                className="buy-button"
              >
                Buy Building
              </Button>
            )}
            {building.isBought &&
              user.role === "provider" &&
              building.floors.every((floor) =>
                floor.slots.every((slot) => slot.isAvailable)
              ) && (
                <Button
                  type="primary"
                  danger
                  onClick={handleLeaveBuilding}
                  className="leave-button"
                >
                  Leave Building
                </Button>
              )}
          </div>
        </Content>
      </Layout>

      <Modal
        title="Buy Building"
        visible={isBuyBuildingModalVisible}
        onCancel={handleModalClose}
        footer={null}
        centered
      >
        <Form layout="vertical" onFinish={handleConfirmBuyBuilding}>
          <Form.Item
            name="providerName"
            label="Provider Name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={"providerEmail"}
            label="Provider Email"
            rules={[{ required: true, message: "Please enter your email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[
              { required: true, message: "Please enter your phone number" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="cardDetails"
            label="Card Details"
            rules={[
              { required: true, message: "Please enter your card details" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Buy Building
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Leave Building"
        visible={isLeaveBuildingModalVisible}
        onCancel={handleModalClose}
        footer={null}
        centered
      >
        <Form layout="vertical" onFinish={handleConfirmLeaveBuilding}>
          <Form.Item
            name="leaveReason"
            label="Reason for Leaving"
            rules={[{ required: true, message: "Please provide a reason" }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Leave Building
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Reservation Details"
        visible={isReservationModalVisible}
        onCancel={() => setIsReservationModalVisible(false)}
        footer={null}
        className="reservation-details-container"
        centered
      >
       {selectedSlotReservations.length > 0 ? (
        <div>
          <Title level={4} className="title">Reservations</Title>
          {selectedSlotReservations.map((reservation) => (
            <div key={reservation._id} className="reservation-detail">
              <p>
                <strong>Reserved By:</strong> {reservation.reservedByName}
              </p>
              <p>
                <strong>Vehicle Type:</strong> {reservation.vehicleType}
              </p>
              <p>
                <strong>Start Time:</strong> {dayjs(reservation.reservationStartTime).format("YYYY-MM-DD hh:mm A")} ({dayjs(reservation.reservationStartTime).fromNow()})
              </p>
              <p>
                <strong>End Time:</strong> {dayjs(reservation.reservationEndTime).format("YYYY-MM-DD hh:mm A")} ({dayjs(reservation.reservationEndTime).fromNow()})
              </p>
              <div className="cancel-button">
                <Button
                  type="primary"
                  danger
                  onClick={() => handleCancelReservation(reservation._id)}
                >
                  Cancel Reservation
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-reservations">No reservations for this slot.</p>
      )}
      </Modal>

      <Modal
        title="Cancel Reservation"
        visible={isCancelReservationModalVisible}
        onCancel={() => setIsCancelReservationModalVisible(false)}
        footer={null}
        centered
      >
        <Form layout="vertical" onFinish={handleConfirmCancelReservation}>
          <Form.Item
            name="cancellationReason"
            label="Reason for Cancellation"
            rules={[
              {
                required: true,
                message: "Please provide a reason for cancellation",
              },
            ]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Confirm Cancellation
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </HomeLayout>
  );
};

export default BuildingDetails;

"use client";
import React, { useEffect } from "react";
import { Card, Col, Row, Empty } from "antd";
import { useRouter } from "next/navigation";
import "./BuildingList.css";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { buildingThunks } from "@/lib/features/buildings/buildingThunks";

interface Building {
  _id: string;
  ImgUrl: string;
  name: string;
  address: string;
  price: number;
  status: string;
  boughtById: string; // User ID of the person who reserved the building
  boughtByName: string | null; // Could be null if name is not available
}

const BuildingList: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth); // Destructure user from auth state
  const { buildings } = useAppSelector((state) => state.buildings);

  useEffect(() => {
    if (user) {
      dispatch(buildingThunks.fetchAllBuildingDetails(user._id)); // Fetch buildings based on user ID
    }
  }, [dispatch, user]);

  const handleCardClick = (buildingId: string) => {
    router.push(`/providerbuilding/${buildingId}`);
  };

  if (!buildings || buildings.length === 0) {
    return (
      <div className="empty-container">
        <Empty description="No buildings available at the moment." />
      </div>
    );
  }

  const currentUserId = user?._id;

  const reservedBuildings = buildings.filter(
    (building) => building.boughtById === currentUserId
  );

  if (reservedBuildings.length === 0) {
    return (
      <div className="empty-container">
        <Empty
          description="You haven't reserved or bought any buildings yet."
        />
      </div>
    );
  }

  return (
    <div className="building-list">
      <h1 className="page-title">Reserved Buildings</h1>
      <Row gutter={[16, 16]} justify="center">
        {reservedBuildings.map((building: Building) => (
          <Col key={building._id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={<img alt={building.name} src={building.ImgUrl} className="building-image" />}
              className="building-card"
              onClick={() => handleCardClick(building._id)}
            >
              <Card.Meta 
                title={<div className="building-name">{building.name}</div>} 
                description={<div className="building-address">{building.address}</div>} 
              />
              <div className="building-info">
                <div className="building-price">${building.price}</div>
                <div className={`building-status ${building.status === 'Available' ? 'status-available' : 'status-unavailable'}`}>
                  {building.status}
                </div>
                <div className="bought-by">
                  Bought by: {building.boughtByName || "Unknown"}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default BuildingList;

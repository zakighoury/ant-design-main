"use client";
import React, { useEffect } from "react";
import { Card, Col, Row, Spin } from "antd";
import { useRouter } from "next/navigation";
import "./BuildingList.css";
import HomeLayout from "../home/layout";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { buildingThunks } from "@/lib/features/buildings/buildingThunks";

interface Building {
  _id: string;
  ImgUrl: string;
  name: string;
  address: string;
  price: number;
  status: string;
}

const BuildingList: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { role } = useAppSelector((state) => state.auth.user);
  const { buildings, loading } = useAppSelector((state) => state.buildings);

  useEffect(() => {
    dispatch(buildingThunks.fetchAllBuildingDetails(role));
  }, [dispatch, role]);

  const availableBuildings = buildings.filter(
    (building) => building.status === "available"
  );

  const handleCardClick = (buildingId: string) => {
    router.push(`/providerbuilding/${buildingId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (availableBuildings.length === 0)
    return <div>No available buildings found</div>;

  return (
    <HomeLayout>
      <div className="building-list">
        <h1>Buildings</h1>
        <Row gutter={[16, 16]} justify="center">
          {availableBuildings.map((building: Building) => (
            <Col key={building._id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                cover={<img alt={building.name} src={building.ImgUrl} />}
                className="building-card"
                onClick={() => handleCardClick(building._id)}
              >
                <div className="card-content">
                  <Card.Meta
                    title={<div className="building-name">{building.name}</div>}
                    description={
                      <div className="building-address">{building.address}</div>
                    }
                  />
                  <div className="building-price">${building.price}</div>
                  <div className="building-status">{building.status}</div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </HomeLayout>
  );
};

export default BuildingList;

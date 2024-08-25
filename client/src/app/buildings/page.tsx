"use client";
import React, { useEffect } from "react";
import { Card, Col, Row, Spin, Typography, Alert } from "antd";
import { useRouter } from "next/navigation";
import { HomeOutlined } from "@ant-design/icons";
import HomeLayout from "../home/layout";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchBuildings } from "../../lib/features/auth/buildingSlice";
import "./BuildingList.css";

const { Title } = Typography;

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
  const { buildings, loading, error } = useAppSelector((state) => state.building);

  useEffect(() => {
    dispatch(fetchBuildings());
  }, [dispatch]);

  const handleCardClick = (buildingId: string) => {
    router.push(`/buildings/buildingdetails/${buildingId}`);
  };

  // Filter buildings to show only reserved ones
  const reservedBuildings = buildings.filter(
    (building) => building.status === "reserved"
  );

  return (
    <HomeLayout>
      <div className="building-list">
        <Title level={2} className="page-title">
          Reserved Buildings
        </Title>
        {loading ? (
          <div className="loading-container">
            <Spin tip="Loading..." size="large" />
          </div>
        ) : error ? (
          <div className="error-container">
            <Alert message="Error" description={error} type="error" showIcon />
          </div>
        ) : reservedBuildings.length === 0 ? (
          <div className="empty-container">
            <Alert message="No Buildings Found" description="There are no reserved buildings to display." type="info" showIcon />
          </div>
        ) : (
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
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </HomeLayout>
  );
};

export default BuildingList;

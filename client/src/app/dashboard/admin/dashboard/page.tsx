"use client";
import React from "react";
import User from "../users/barcharts/page";
import UserStatusPage from "../users/userstatus/page";
import UserStatusChart from "../users/userstatuschart/page";
import { Card } from "antd";
import "./style.css"; // Ensure you have appropriate styles

const Page: React.FC = () => {
  return (
    <div>
      <div className="page-container">
        <Card className="chart-card" bordered={false}>
          <UserStatusChart />
        </Card>
        <div className="chart-container">
          {/* <Card className="chart-card" bordered={false}>
          <SlotsOverviewPage />
          </Card> */}
          {/* <Card className="dashboard-card" bordered={false}> */}
            <User />
          {/* </Card> */}
        <Card className="dashboard-card" bordered={false}>
          <UserStatusPage />
        </Card>
        </div>
      </div>
      {/* <div className="dashboard-cards">
        <Card className="dashboard-card" bordered={false}>
          <Provider />
        </Card>
        <Card className="dashboard-card" bordered={false}>
          <Customer />
        </Card>
      </div> */}
    </div>
  );
};

export default Page;

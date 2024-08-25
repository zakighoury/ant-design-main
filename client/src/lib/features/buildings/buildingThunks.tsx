import { message } from "antd";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

const getAuthHeaders = () => {
  const token = Cookies.get("token");
  const role = Cookies.get("role");
  return {
    Authorization: `Bearer ${token}`,
    "X-User-Role": role, // Add role to headers with a custom header name
  };
};

export const buildingThunks = {
  fetchAllBuildingDetails: createAsyncThunk(
    "buildings/fetchAllBuildingDetails",
    async (role: string, { rejectWithValue }) => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/provider/buildings/all`,
          {
            headers: getAuthHeaders(),
          }
        );
        if (data.success) {
          // message.success(data.message);
          return data.buildings;
        }
      } catch (error: any) {
        message.error(
          error.response.data.message ?? "Failed to fetch all buildings"
        );
        return rejectWithValue(
          error.response.data.message ?? "Failed to fetch all buildings"
        );
      }
    }
  ),
  fetchBuildingDetails: createAsyncThunk(
    "buildings/fetchBuildingDetails",
    async ({ id }: { id: string }, { rejectWithValue }) => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/provider/buildings/${id}`
        );
        if (data.success) {
          // message.success(data.message);
          console.log("🚀 ~ data:", data.building);
          return data.building;
        }
      } catch (error: any) {
        message.error(
          error.response.data.message ?? "Failed to fetch building"
        );
        rejectWithValue(
          error.response.data.message ?? "Failed to fetch building"
        );
      }
    }
  ),
  cancelReservation : createAsyncThunk(
    "reservations/cancelReservation",
    async (
      { reservationId, cancelReason }: { reservationId: string; cancelReason: string },
      { rejectWithValue }
    ) => {
      try {
        const { data } = await axios.post(
          `http://localhost:5000/api/provider/reservations/${reservationId}/cancel`,
          { reservationId, cancelReason },
          {
            headers: getAuthHeaders(),
          }
        );
        if (data.success) {
          message.success(data.message);
          return reservationId;
        }
      } catch (error: any) {
        message.error(
          error.response.data.message ?? "Failed to cancel reservation"
        );
        return rejectWithValue(
          error.response.data.message ?? "Failed to cancel reservation"
        );
      }
    }
  ),
};
  
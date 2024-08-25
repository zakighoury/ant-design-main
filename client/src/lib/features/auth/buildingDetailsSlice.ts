// import { buyBuilding } from "./buildingDetailsSlice";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { message } from "antd";
import axios from "axios";
import Cookies from "js-cookie";
import type { PayloadAction } from "@reduxjs/toolkit";

interface Slot {
  number: number;
  isAvailable: boolean;
  isReserved: boolean;
  reservationStartTime?: string;
  reservationEndTime?: string;
  vehicleType?: string;
}

interface Floor {
  number: number;
  slots: Slot[];
}

interface Building {
  _id: string;
  name: string;
  address: string;
  description: string;
  ImgUrl: string;
  price: number;
  isBought: boolean;
  floors: Floor[];
}

interface BuildingState {
  building: Building | null;
  loading: boolean;
  error: string | null;
  allBuildings: Building[];
}

const initialState: BuildingState = {
  building: null,
  loading: false,
  error: null,
  allBuildings: [],
};
const getAuthHeaders = () => {
  const token = Cookies.get("token");
  const role = Cookies.get("role");
  return {
    Authorization: `Bearer ${token}`,
    "X-User-Role": role || "", // Add role to headers with a custom header name
  };
};
export const fetchBuildingDetails = createAsyncThunk(
  "buildingDetails/fetchBuildingDetails",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/customer/buildings/${id}`,
        { headers: getAuthHeaders() }
      );
      if (data.success) {
        // message.success(data.message);
        console.log("🚀 ~ data:", data.building);
        return data.building;
      }
    } catch (error: any) {
      rejectWithValue(error.response.data.message);
    }
  }
);
export const fetchAllBuildingDetails = createAsyncThunk(
  "buildingDetails/fetchAllBuildingDetails",
  async (role: string, { rejectWithValue }) => {
    console.log("🚀 ~ role:", role);

    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/${role}/buildings/all`,
        { headers: getAuthHeaders() }
      );

      if (data.success) {
        // message.success(data.message);
        console.log("🚀 ~ data:", data.buildings);
        return data.buildings;
      }
    } catch (error: any) {
      rejectWithValue(error.response.data.message);
    }
  }
);

export const buyBuilding = createAsyncThunk(
  "buildingDetails/buyBuilding",
  async (
    {
      id,
      providerName,
      providerEmail,
      phoneNumber,
      cardDetails,
      price,
    }: {
      id: string;
      providerName: string;
      providerEmail: string;
      phoneNumber: string;
      cardDetails: string;
      price: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/provider/buildings/${id}/buy`,
        { providerName, providerEmail, phoneNumber, cardDetails, price },
        { headers: getAuthHeaders() }
      );
      if (data.success) {
        message.success(data.message);
        return data.building;
      }
    } catch (error: any) {
      message.error(error.response.data.message || "Error buying building");
      return rejectWithValue(
        error.response.data.message || "Error buying building"
      );
    }
  }
);

export const leaveBuilding = createAsyncThunk(
  "buildingDetails/leaveBuilding",
  async (
    { id, leaveReason }: { id: string; leaveReason: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/provider/${id}/leave`,
        { leaveReason },
        { headers: getAuthHeaders() }
      );
      if (data.success) {
        message.success(data.message);
        return data.building;
      }
      return data;
    } catch (error: any) {
      message.error(error.response.data.message || "Error leaving building");
      return rejectWithValue(
        error.response.data.message || "Error leaving building"
      );
    }
  }
);

export const reserveSlot = createAsyncThunk(
  "buildingDetails/reserveSlot",
  async (
    {
      id,
      floorNumber,
      slotNumber,
      reservationStartTime,
      reservationEndTime,
      vehicleType,
      price,
    }: {
      id: string;
      floorNumber: number;
      slotNumber: number;
      reservationStartTime: string;
      reservationEndTime: string;
      vehicleType: string;
      price: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/customer/${id}/reserve`,
        {
          floorNumber,
          slotNumber,
          reservationStartTime,
          reservationEndTime,
          vehicleType,
          price,
        },
        { headers: getAuthHeaders() }
      );
      message.success(data.message);
      if (data.success) {
        return data.building;
      }
    } catch (error: any) {
      message.error(error.response.data.message);
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const cancelReservation = createAsyncThunk(
  "buildingDetails/cancelReservation",
  async (
    {
      id,
      floorNumber,
      slotNumber,
      reservationIndex,
      vehicleType,
    }: {
      id: string;
      floorNumber: number;
      slotNumber: number;
      reservationIndex: number;
      vehicleType: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/customer/${id}/cancel`,
        { floorNumber, slotNumber, reservationIndex, vehicleType },
        { headers: getAuthHeaders() }
      );
      message.success(data.message);
      if (data.success) {
        return data.building;
      }
    } catch (error: any) {
      message.error(error.response.data.message);
      return rejectWithValue(error.response.data.message);
    }
  }
);

const buildingDetailsSlice = createSlice({
  name: "buildingDetails",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBuildingDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchBuildingDetails.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.building = action.payload;
          state.loading = false;
        }
      )
      .addCase(
        fetchBuildingDetails.rejected,
        (state, action: PayloadAction<any>) => {
          state.error = action.payload;
          message.error(action.payload);
          state.loading = false;
        }
      )
      .addCase(buyBuilding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buyBuilding.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(buyBuilding.rejected, (state, action: PayloadAction<any>) => {
        state.error = action.payload ?? "Failed to buy building";
        state.loading = false;
      })
      .addCase(leaveBuilding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveBuilding.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(leaveBuilding.rejected, (state, action: PayloadAction<any>) => {
        state.error = action.payload ?? "Failed to leave building";
        state.loading = false;
      })
      .addCase(reserveSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reserveSlot.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(reserveSlot.rejected, (state, action: PayloadAction<any>) => {
        state.error = action.payload ?? "Failed to reserve slot";
        state.loading = false;
      })
      .addCase(
        cancelReservation.pending,
        (state, action: PayloadAction<any>) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addCase(cancelReservation.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(
        cancelReservation.rejected,
        (state, action: PayloadAction<any>) => {
          state.error = action.payload ?? "Failed to cancel reservation";
          state.loading = false;
        }
      )
      .addCase(
        fetchAllBuildingDetails.pending,
        (state, action: PayloadAction<any>) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addCase(
        fetchAllBuildingDetails.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.allBuildings = action.payload;
          state.loading = false;
        }
      )
      .addCase(
        fetchAllBuildingDetails.rejected,
        (state, action: PayloadAction<any>) => {
          state.error = action.payload ?? "Failed to fetch all buildings";
          state.loading = false;
        }
      );
  },
});

export default buildingDetailsSlice.reducer;

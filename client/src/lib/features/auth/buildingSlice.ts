import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";
import { message } from "antd";

// Helper function to get auth token and role from cookies
const getAuthHeaders = () => {
  const token = Cookies.get("token");
  const role = Cookies.get("role");
  return {
    Authorization: `Bearer ${token}`,
    "X-User-Role": role || "", // Add role to headers with a custom header name
  };
};

export const fetchBuildings = createAsyncThunk(
  "buildings/fetchBuildings",
  async (role: string, {rejectWithValue} ) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/buildings/all`,
        {
          headers: getAuthHeaders(),
        }
      );
      const data = response.data;
      if (data.success) {
        // message.success(data.message);
        return data.buildings;
      } else {
        return rejectWithValue(data.message);
      }
    } catch (error: any) {
      console.error("Error fetching buildings:", error);
      return rejectWithValue(error.message);
    }
  }
);

interface Building {
  _id: string;
  ImgUrl: string;
  name: string;
  address: string;
  price: number;
  status: string;
}

interface BuildingState {
  buildings: Building[];
  loading: boolean;
  error: string | null;
}

const initialState: BuildingState = {
  buildings: [],
  loading: false,
  error: null,
};

const buildingsSlice = createSlice({
  name: "buildings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBuildings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBuildings.fulfilled, (state, action: PayloadAction<Building[]>) => {
        state.loading = false;
        state.buildings = action.payload;
      })
      .addCase(fetchBuildings.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch buildings';
      });
  },
});

export default buildingsSlice.reducer;

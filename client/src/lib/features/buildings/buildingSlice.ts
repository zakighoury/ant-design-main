import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { buildingThunks } from "./buildingThunks";

interface BuildingSlice {
  buildings: Array<any> | [];
  loading: boolean;
  error: string | null;
  singleBuilding?: object | null;
}

const initialState: BuildingSlice = {
  buildings: [],
  loading: false,
  error: null,
  singleBuilding: {},
};

const buildingsSlice = createSlice({
  name: "building",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(buildingThunks.fetchAllBuildingDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        buildingThunks.fetchAllBuildingDetails.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.buildings = action.payload;
          state.loading = false;
        }
      )
      .addCase(
        buildingThunks.fetchAllBuildingDetails.rejected,
        (state, action: PayloadAction<any>) => {
          state.error = action.payload;
          state.loading = false;
        }
      )
      .addCase(buildingThunks.fetchBuildingDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        buildingThunks.fetchBuildingDetails.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.singleBuilding = action.payload;
          state.loading = false;
        }
      )
      .addCase(
        buildingThunks.fetchBuildingDetails.rejected,
        (state, action: PayloadAction<any>) => {
          state.error = action.payload;
          state.loading = false;
        }
      );
  },
});

export default buildingsSlice.reducer;

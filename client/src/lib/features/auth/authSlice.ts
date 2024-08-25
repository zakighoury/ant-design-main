import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { authThunks } from "./authThunks";
import Cookies from "js-cookie";
import { Spin } from "antd";
interface AuthState {
  user: any;
  isLoggedIn: boolean;
  loading: boolean;
  verified: boolean;
  error: string | null;
}
const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
  loading: false,
  error: null,
  verified: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signin: (state, action: PayloadAction<any>) => {
      const { user: data } = action.payload;
      const user = {
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        role: data.role,
        _id: data._id,
      };
      localStorage.setItem(
        "auth",
        JSON.stringify({
          user,
          isLoggedIn: true,
          verified: true,
        })
      );
      Object.assign(state, {
        user,
        isLoggedIn: true,
        verified: true,
      });
    },
    signout: (state) => {
      Cookies.remove("auth", { path: "/login" });

      state.user = null;
      state.isLoggedIn = false;
      state.verified = false;
    },
    initializeAuthState: (state) => {
      const auth = localStorage.getItem("auth");
      if (auth) {
        const { user } = JSON.parse(auth);

        Object.assign(state, {
          user,
          isLoggedIn: true,
          verified: true,
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(authThunks.signup.pending, (state) => {
        state.loading = true;

        state.error = null;
      })
      .addCase(authThunks.signup.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isLoggedIn = false;
        state.verified = false;
        state.error = null;
      })
      .addCase(
        authThunks.signup.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
      .addCase(authThunks.signin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        authThunks.signin.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.user = action.payload;
          state.isLoggedIn = true;
          state.verified = true;
        }
      )
      .addCase(
        authThunks.signin.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
      .addCase(authThunks.signout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(authThunks.signout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isLoggedIn = false;
        state.verified = false;
        state.error = null;
      })
      .addCase(
        authThunks.signout.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { signin, signout, initializeAuthState } = authSlice.actions;

export default authSlice.reducer;

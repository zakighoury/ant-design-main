import { message } from "antd";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { signin as signinAction } from "./authSlice";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export const authThunks = {
  signup: createAsyncThunk(
    "auth/signup",
    async (
      values: { name: string; email: string; role: string; password: string },
      { rejectWithValue }
    ) => {
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/sign-up`,
          values
        );
        if (data.success) {
          message.success(data.message); // Display success message
          return data;
        }
      } catch (error: any) {
        console.error(error.response.data.message);
        message.error(error.response.data.message);
        return rejectWithValue(error.response.data.message);
      }
    }
  ),

  signin: createAsyncThunk(
    "auth/signin",
    async (
      {
        values,
        router,
      }: {
        values: { email: string; password: string; role: string };
        router: any;
      },
      { rejectWithValue, dispatch }
    ) => {
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/sign-in`,
          values
        );
        message.success(data.message); // Display success message
        if (data.success) {
          dispatch(signinAction({ user: data.user }));
          const { token } = data;
          Cookies.set("token", token, { path: "/" });
          Cookies.set("role", data.user.role, { path: "/" });
          Cookies.set("userId", data.user._id, { path: "/" });
          Cookies.set("isLoggedIn", data.user.isLoggedIn, { path: "/" });

          // Redirect based on user role
          if (data.user.role === "admin") {
            router.push("/dashboard/admin/adminlayout");
          } else if (data.user.role === "provider") {
            router.push("/providerbuilding");
          } else if (data.user.role === "customer") {
            router.push("/buildings");
          }

          return data.user;
        }
      } catch (error: any) {
        console.error("Error signing in:", error.response.data.message);
        message.error(error.response.data.message);
        return rejectWithValue("Error signing in, please try again!");
      }
    }
  ),

  signout: createAsyncThunk(
    "auth/signout",
    async (_, { rejectWithValue, dispatch }) => {
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/sign-out`,
          {
            userId: Cookies.get("userId"),
          }
        );
        if (data.success) {
          message.success(data.message); // Display success message
          console.log(data.message, "data");
          localStorage.removeItem("auth");
          localStorage.removeItem("ally-supports-cache");
          const router = useRouter();
          router.push("/login");
          return true;
        }
      } catch (error: any) {
        console.error("Error logging out:", error.response.data.message);
        message.error(error.response.data.message);
        return rejectWithValue("Error logging out, please try again!");
      }
    }
  ),
};

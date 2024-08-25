import axios from "axios";
import Cookies from "js-cookie";
import { message } from "antd";
import { Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import { RootState } from "../../store"; // Adjust the path as needed

// Action Types
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAIL = "LOGIN_FAIL";
export const LOGOUT = "LOGOUT";

// Define Action Interfaces
interface LoginSuccessAction {
  type: typeof LOGIN_SUCCESS;
  payload: string; // token
}

interface LoginFailAction {
  type: typeof LOGIN_FAIL;
  payload: string; // error message
}

interface LogoutAction {
  type: typeof LOGOUT;
}

type AuthActionTypes = LoginSuccessAction | LoginFailAction | LogoutAction;

// Define Thunk Action Type
type ThunkResult<R> = ThunkAction<R, RootState, undefined, AuthActionTypes>;

// Function to get authorization headers
const getAuthHeaders = () => {
  const token = Cookies.get("token");
  const role = Cookies.get("role"); // Retrieve role from cookies
  return {
    Authorization: `Bearer ${token}`,
    'X-User-Role': role || "" // Add role to headers with a custom header name
  };
};

// Login Action Creator
export const login = (username: string, password: string): ThunkResult<void> => async (dispatch: Dispatch<AuthActionTypes>) => {
  try {
    // Send login request without additional headers
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin`, { username, password });
    // Extract data
    console.log(response.data)
    const { token, role } = response.data;

    // Set token and role in cookies
    Cookies.set("token", token, { path: "/dashboard/admin/adminlayout" }); // Set token cookie
    Cookies.set("role", role, { path: "/dashboard/admin/adminlayout" });   // Set role cookie
    console.log(token,role,"trole")

    // Dispatch login success
    dispatch({ type: LOGIN_SUCCESS, payload: token });

    // Show success message
    message.success("Admin logged in successfully!");

    // Redirect to the admin dashboard
    window.location.href = "/dashboard/admin/adminlayout";

  } catch (error) {
    // Dispatch login failure
    dispatch({ type: LOGIN_FAIL, payload: error.response?.data?.message || "Login failed!" });
    // window.location.href = "/home/403";

    // Show error message
    message.error(error.response?.data?.message || "Login failed!");
  }
};

// Logout Action Creator
export const logout = (): ThunkResult<void> => (dispatch: Dispatch<AuthActionTypes>) => {
  // Remove cookies
  Cookies.remove("token");
  Cookies.remove("role");

  // Dispatch logout
  dispatch({ type: LOGOUT });

  // Show success message
  message.success("Logged out successfully!");
};

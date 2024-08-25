import axios from 'axios';
import { Dispatch } from 'redux';

// Action Types
export const ADD_BUILDING_REQUEST = 'ADD_BUILDING_REQUEST';
export const ADD_BUILDING_SUCCESS = 'ADD_BUILDING_SUCCESS';
export const ADD_BUILDING_FAILURE = 'ADD_BUILDING_FAILURE';

// Action Creators
const addBuildingRequest = () => ({ type: ADD_BUILDING_REQUEST });
const addBuildingSuccess = (building: any) => ({ type: ADD_BUILDING_SUCCESS, payload: building });
const addBuildingFailure = (error: any) => ({ type: ADD_BUILDING_FAILURE, payload: error });

export const addBuilding = (buildingData: FormData) => async (dispatch: Dispatch) => {
  dispatch(addBuildingRequest());
  try {
    const response = await axios.post('http://localhost:5000/api/buildings', buildingData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    dispatch(addBuildingSuccess(response.data));
  } catch (error) {
    dispatch(addBuildingFailure(error));
  }
};

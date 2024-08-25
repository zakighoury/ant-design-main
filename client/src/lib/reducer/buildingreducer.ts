import { ADD_BUILDING_REQUEST, ADD_BUILDING_SUCCESS, ADD_BUILDING_FAILURE } from '../features/action/building';

const initialState = {
  buildings: [],
  loading: false,
  error: null,
};

const buildingsReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case ADD_BUILDING_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case ADD_BUILDING_SUCCESS:
      return {
        ...state,
        loading: false,
        buildings: [...state.buildings, action.payload],
      };
    case ADD_BUILDING_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default buildingsReducer;
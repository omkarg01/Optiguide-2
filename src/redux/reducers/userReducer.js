import * as LocalStorage from "../../utils/localstorage";
import { userActionTypes } from "../actions/actionTypes";

const intialState = {
  userDetails: LocalStorage.getLSValue("user") || null,
};

const userReducer = (state = intialState, action) => {
  switch (action.type) {
    case userActionTypes.SET_USER_DETAILS: {
      return { ...state, userDetails: action.payload };
    }
    default:
      return state;
  }
};

export default userReducer;

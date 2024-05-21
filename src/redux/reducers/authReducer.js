import * as LocalStorage from "../../utils/localstorage";
import { authActionTypes } from "../actions/actionTypes";

const intialState = {
  isLoggedIn: Boolean(LocalStorage.getLSValue("token")),
  token:LocalStorage.getLSValue("token")
};

const authReducers = (state = intialState, action) => {
  switch (action.type) {
    case authActionTypes.SET_IS_LOGGEDIN:
        return { ...state, isLoggedIn: Boolean(action.payload) }
    case authActionTypes.LOGOUT:
        return {...state,isLoggedIn:false} 
    default:
        return state     
  }
};

export default authReducers;

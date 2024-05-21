import { authActionTypes } from "./actionTypes"
import * as LocalStorage from "../../utils/localstorage";





export const setIsLoggedIn = (token)=>{
    LocalStorage.setLSValue('token',token)
    return {
        type:authActionTypes.SET_IS_LOGGEDIN,
        payload:token
    }
}



export const logoutUser = ()=>{
    LocalStorage.clearLS()
    return {
        type:authActionTypes.LOGOUT,
    }
}
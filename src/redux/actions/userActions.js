import { userActionTypes } from "./actionTypes"
import * as LocalStorage from "../../utils/localstorage";


export const setUserDetails = (value)=>{
    LocalStorage.setLSValue('user',value||"")
    return {
        type:userActionTypes.SET_USER_DETAILS,
        payload:value
    }
}

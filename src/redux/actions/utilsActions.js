import { utilsActionsTypes } from "./actionTypes"



export const showToast = (value)=>{
    return {
        type:utilsActionsTypes.SHOW_TOAST,
        payload:value
    }
}

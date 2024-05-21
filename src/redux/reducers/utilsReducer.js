


import { utilsActionsTypes } from "../actions/actionTypes";

const intialState = {
    toast:null
}

const utilsReducer = (state=intialState,action)=>{
    switch(action.type){
        case utilsActionsTypes.SHOW_TOAST:{
            return {...state,toast:action.payload}
        }
        default:
            return state
    }
}

export default utilsReducer;


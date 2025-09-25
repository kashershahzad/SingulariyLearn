import { createSlice } from "@reduxjs/toolkit";
import { lang } from "moment/moment";

const initialState = {  
    language: 'en',
}
export const LanguageConfigSlice = createSlice({
    name: 'LanguageConfig',
    initialState: initialState,
    reducers:{
        setLanguage(state, action){
            state.language = action.payload
        }
    }
})

export const {setLanguage} = LanguageConfigSlice.actions;
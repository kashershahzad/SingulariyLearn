import { createSlice } from "@reduxjs/toolkit";

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
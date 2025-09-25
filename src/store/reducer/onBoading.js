import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  OnBoarding: false, 
}

export const OnBoardingSlice = createSlice({
    name: 'OnBoarding',
    initialState: initialState,
    reducers: {
        setOnBoarding(state, action){
            state.OnBoarding = action.payload
        }
    }
})

export const {setOnBoarding} = OnBoardingSlice.actions;
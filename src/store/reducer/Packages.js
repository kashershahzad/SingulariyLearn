import { createSlice } from "@reduxjs/toolkit";
import reducer, { usersSlice } from "./usersSlice";

export const PackageSlice = createSlice({
    name:'package',
    initialState:{
        package:false
    },
    reducers:{
    setPackage(state, action){
        state.package= action.payload
        console.log(state.package)
    }
 }
})

export const { setPackage } = PackageSlice.actions;
 export default PackageSlice.reducer;
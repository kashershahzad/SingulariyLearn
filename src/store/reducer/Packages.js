import { createSlice } from "@reduxjs/toolkit";
import reducer, { usersSlice } from "./usersSlice";

export const PackageSlice = createSlice({
    name:'package',
    initialState:{
        package:false
    },
    reducer:{
    setPackage(state, action){
        state.package= action.payload
        console.log(state.package)
    }
 }
})

 export const {setPackage} = usersSlice.actions
 export default usersSlice.reducer;
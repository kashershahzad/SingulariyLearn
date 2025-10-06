import {createSlice} from '@reduxjs/toolkit';

export const usersSlice = createSlice({
  name: 'users',
  initialState: {
    userData: {},
    location: {},
  },
  reducers: {
    setUserData(state, action) {
      state.userData = action.payload;
      console.log('User data set:', state.userData);
    },
    setLocation(state, action) {
      state.location = action.payload;
    },
    logoutUser(state, action){
      state.userData=""
       console.log('data set when logout:', state.userData);
    }
  },
});

export const {setUserData, setLocation,logoutUser} = usersSlice.actions;
export default usersSlice.reducer;

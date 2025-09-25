import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  token: '',
  isOnBoarding: false,
  userinfo: {},
};
export const authConfigsSlice = createSlice({
  name: 'authConfigs',
  initialState: initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
      console.log('Token set:', state.token);
    },
    setOnBoarding(state, action) {
      state.isOnBoarding = action.payload;
    },
    logout(state, action) {
      state.token = '';
      console.log('Token set when logout:', state.token);
    },
  },
});

export const {setToken, setOnBoarding, logout} = authConfigsSlice.actions;

import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  /** Default light (white) when user has not set a preference */
  isDarkMode: false,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setDarkMode(state, action) {
      state.isDarkMode = Boolean(action.payload);
    },
    toggleDarkMode(state) {
      state.isDarkMode = !state.isDarkMode;
    },
  },
});

export const {setDarkMode, toggleDarkMode} = themeSlice.actions;

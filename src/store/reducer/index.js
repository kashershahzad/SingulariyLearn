import {combineReducers} from 'redux';

import {authConfigsSlice} from './AuthConfig';
import {usersSlice} from './usersSlice';
import {chatSlice} from './ChatSlice';
import { OnBoardingSlice } from './onBoading';
import { LanguageConfigSlice } from './LanguageConfig';

export const rootReducer = combineReducers({
  users: usersSlice.reducer,
  authConfig: authConfigsSlice.reducer,
  chat: chatSlice.reducer,
  OnBoarding: OnBoardingSlice.reducer,
  language: LanguageConfigSlice.reducer,
});

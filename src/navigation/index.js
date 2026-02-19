import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import React from 'react';

//screens
import AuthStack from './AuthStack';
import MainStack from './MainStack';

const Stack = createNativeStackNavigator();

const RootNavigation = () => {
  const isToken = useSelector(state => state.authConfig.token);

  // Language is synced to i18n in App.js from state.language (LanguageConfig)
  return (
    <Stack.Navigator
    // initialRouteName='MainStack'
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      {isToken ? (
        <>
          <Stack.Screen name="MainStack" component={MainStack} />
        </>
      ) : (
        <>
          <Stack.Screen name="AuthStack" component={AuthStack} />
          <Stack.Screen name="MainStack" component={MainStack} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigation;

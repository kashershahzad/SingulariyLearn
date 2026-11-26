import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import Profile from '../screens/Main/Profile';
import Study from '../screens/Main/Study';
import StatsScreen from '../screens/Main/Stats/index';
import LandingPage from '../screens/Main/LandingPage';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={() => null}
      screenOptions={{
        tabBarStyle: {display: 'none'},
        tabBarShowLabel: false,
        headerShown: false,
      }}>
      <Tab.Screen name="LandingPage" component={LandingPage} />
      <Tab.Screen name="Study" component={Study} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

const TabStack = () => <TabNavigator />;

export default TabStack;

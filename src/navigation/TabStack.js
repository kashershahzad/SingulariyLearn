import React from 'react';
import { Image, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { tabIcons } from '../assets/images/tabIcons';
import { COLORS } from '../utils/COLORS';
import fonts from '../assets/fonts';
import HomeScreen from '../screens/Main/HomeScreen';
import DmvTest from '../screens/Main/dmvtest';
import ProfileScreen from '../screens/Main/profileScreen';

const Tab = createBottomTabNavigator();

const TabStack = () => {
  const { t } = useTranslation();
  const packages = useSelector((state) => state.package.package);
  const userData = useSelector(state => state.users.userData)

  return (
    <SafeAreaProvider>
      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: fonts.regular,
          },
          tabBarStyle: {
            height: Platform.OS === 'android' ? 80 : 85, 
            backgroundColor: COLORS.white,
            elevation: 10,
            paddingBottom: Platform.OS === 'android' ? 18 : 22,
            borderTopWidth: 0.6,
            borderTopColor: COLORS.lightGray,
            paddingTop: 5,
          },
          tabBarShowLabel: true,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: COLORS.primaryColor4,
          headerShown: false,
        }}
      >
        {/* Home Tab */}
        <Tab.Screen
          name={t('Home')}
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={tabIcons.home2}
                style={[
                  styles.icon,
                  { tintColor: focused ? COLORS.btn : COLORS.tabIcon },
                ]}
              />
            ),
          }}
        />

        {/* DMV Test (Conditional Tab) */}
        {userData.purchase !== undefined && (
          <Tab.Screen
            name={t('Dmv Test')}
            component={DmvTest}
            options={{
              tabBarIcon: ({ focused }) => (
                <Image
                  source={tabIcons.dmvtest}
                  style={[
                    styles.icon,
                    { tintColor: focused ? COLORS.btn : COLORS.tabIcon },
                  ]}
                />
              ),
            }}
          />
        )}

        {/* Profile Tab */}
        <Tab.Screen
          name={t('ProfileScreen')}
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={tabIcons.profile}
                style={[
                  styles.icon,
                  { tintColor: focused ? COLORS.btn : COLORS.tabIcon },
                ]}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaProvider>
  );
};

export default TabStack;

const styles = StyleSheet.create({
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 10,
    fontFamily: fonts.semiBold,
    bottom: 12,
  },
});

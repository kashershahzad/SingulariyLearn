import React from 'react';
import {Image, Platform, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';

import {tabIcons} from '../assets/images/tabIcons';
import {useTheme} from '../theme/useTheme';
import fonts from '../assets/fonts';
import Home from '../screens/Main/Home';
import Profile from '../screens/Main/Profile';
import Study from '../screens/Main/Study';
import StatsScreen from '../screens/Main/Stats/index';

const Tab = createBottomTabNavigator();
const TAB_BAR_CONTENT_HEIGHT = 57;

const TabNavigator = () => {
  const {colors} = useTheme();
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();

  const bottomInset =
    Platform.OS === 'android'
      ? Math.max(insets.bottom, 12)
      : Math.max(insets.bottom, 22);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: fonts.regular,
        },
        tabBarStyle: {
          height: TAB_BAR_CONTENT_HEIGHT + bottomInset,
          backgroundColor: colors.tabBar,
          elevation: 10,
          paddingBottom: bottomInset,
          borderTopWidth: 0.6,
          borderTopColor: colors.tabBarBorder,
          paddingTop: 5,
        },
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: t('screens.tabs.home'),
          tabBarIcon: () => (
            <Image source={tabIcons.house} style={styles.icon} />
          ),
        }}
      />

      <Tab.Screen
        name="Study"
        component={Study}
        options={{
          tabBarLabel: t('screens.tabs.study'),
          tabBarIcon: () => (
            <Image source={tabIcons.books} style={styles.icon} />
          ),
        }}
      />

      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarLabel: t('screens.tabs.stats'),
          tabBarIcon: () => (
            <Image source={tabIcons.stats} style={styles.icon} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: t('screens.tabs.profile'),
          tabBarIcon: () => (
            <Image source={tabIcons.profile2} style={styles.icon} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const TabStack = () => <TabNavigator />;

export default TabStack;

const styles = StyleSheet.create({
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});

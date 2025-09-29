import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, Platform, StyleSheet } from 'react-native';
import { tabIcons } from '../assets/images/tabIcons';
import { COLORS } from '../utils/COLORS';
import fonts from '../assets/fonts';
import HomeScreen from '../screens/Main/HomeScreen';
import { useTranslation } from 'react-i18next';
import DmvTest from '../screens/Main/dmvtest';
import ProfileScreen from '../screens/Main/profileScreen';
import { useSelector } from 'react-redux';

const Tab = createBottomTabNavigator();
const TabStack = () => {
  const { t } = useTranslation();
  const packages = useSelector((state) => state.package.package); 
  console.log(packages)
  return (
    <Tab.Navigator
      screenOptions={() => ({
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: fonts.regular,
        },
        tabBarStyle: {
          height: Platform.OS == 'android' ? 70 : 80,
          backgroundColor: COLORS.white,
          elevation: 10,
          paddingBottom: Platform.OS == 'android' ? 12 : 22,
          borderTopWidth: 0.6,
          borderTopColor: COLORS.lightGray,
          paddingTop: 5,
        },
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: COLORS.primaryColor4,
        headerShown: false,
      })}>

      <Tab.Screen
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={tabIcons.home2}
              style={[
                styles.icon,
                { tintColor: focused ? COLORS.primaryColor4 : COLORS.tabIcon },
              ]}
            />
          ),
        }}
        name={t('Home')}
        component={HomeScreen}
      />

{
  packages === true ? <Tab.Screen
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={tabIcons.dmvtest}
              style={[
                styles.icon,
                { tintColor: focused ? COLORS.primaryColor4 : COLORS.tabIcon },
              ]}
            />
          ),
        }}
        name={t('Dmv Test')}
        component={DmvTest}
      /> : null
}

      


      <Tab.Screen
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={tabIcons.profile}
              style={[
                styles.icon,
                { tintColor: focused ? COLORS.primaryColor4 : COLORS.tabIcon },
              ]}
            />
          ),
        }}
        name={t('ProfileScreen')}
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
};

export default TabStack;

const styles = StyleSheet.create({
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  homeIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: COLORS.white,
  },
  text: {
    fontSize: 10,
    fontFamily: fonts.semiBold,
    bottom: 12,
  },
});

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import React from 'react';

//screens

import getStarted from '../screens/Auth/GetStarted';
import OnBoarding from '../screens/Auth/OnBoarding';
import OTPScreen from '../screens/Auth/OTPScreen';
import Signup from '../screens/Auth/Signup';
import Login from '../screens/Auth/Login';
import LandingPage from '../screens/Auth/LandingPage';
import TabStack from './TabStack';
import Language from '../screens/Auth/Language';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import ImmigrationOnBoading from '../screens/Main/Immigration/ImmigrationOnBoading';
import Immigration from '../screens/Main/Immigration';
import Mockuptest from '../screens/Main/dmvtest/mockuptest';
import Congratulations from '../screens/Main/dmvtest/Congratulations'
import Result from '../screens/Main/dmvtest/Result';
import ForgetPassword from '..//screens/Auth/ForgetPassword';
import Newpassword from '../screens/Auth/NewPassword';



import DmvLicensesOnboading from '../screens/Main/DmvLicenses/DmvLicensesOnboading';
import PermitType from '../screens/Main/DmvLicenses/PermitType';
import HowToDo from '../screens/Main/DmvLicenses/HowToDo';
import CarPadel from '../screens/Main/DmvLicenses/HowToDo/CarPadel';
import AdjestingMirror from '../screens/Main/DmvLicenses/HowToDo/AdjestingMirror';
import ParallelParking from '../screens/Main/DmvLicenses/HowToDo/ParallelParking';
import ReverseParking from '../screens/Main/DmvLicenses/HowToDo/ReverseParking';
import RoundAbout from '../screens/Main/DmvLicenses/HowToDo/RoundAbout';
import Lparking from '../screens/Main/DmvLicenses/HowToDo/LParking';
import AdultPermit from '../screens/Main/DmvLicenses/PermitType/AdultPermit';
import SelectPackage from '../screens/Main/DmvLicenses/PermitType/SelectPackage';
import Checkout from '../screens/Main/DmvLicenses/PermitType/Checkout'
import PaymentMethod from '../screens/Main/DmvLicenses/PermitType/PaymentMethod';
import AddAcc from '../screens/Main/DmvLicenses/PermitType/AddAcc';
import AddCard from '../screens/Main/DmvLicenses/PermitType/AddCard';
import Recipient from '../screens/Main/DmvLicenses/PermitType/Recipient';
import ComingSoon from '../screens/Main/ComingSoon'



const Stack = createNativeStackNavigator();

const AuthStack = () => {
  const isOnBoarding = useSelector(state => state.authConfig.isOnBoarding);
  console.log(isOnBoarding);
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    // initialRouteName="Language"
    >
      {/* {!isOnBoarding && (
        <>
          <Stack.Screen name="OnBoarding" component={OnBoarding} />
          <Stack.Screen name="getStarted" component={getStarted} />
        </>
      )} */}
      {/* <Stack.Screen name="TabStack" component={TabStack} /> */}
      <Stack.Screen name="LandingPage" component={LandingPage} />
      

      <Stack.Screen name="DmvLicensesOnboading" component={DmvLicensesOnboading} />
      <Stack.Screen name="PermitType" component={PermitType} />
      <Stack.Screen name="AdultPermit" component={AdultPermit} />
      <Stack.Screen name="SelectPackage" component={SelectPackage} />
      <Stack.Screen name="Checkout" component={Checkout} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethod} />
      <Stack.Screen name="AddAcc" component={AddAcc} />
      <Stack.Screen name="AddCard" component={AddCard} />

      <Stack.Screen name="Immigration" component={Immigration} />
      <Stack.Screen name="ImmigrationOnBoading" component={ImmigrationOnBoading} />

      <Stack.Screen name="Mockuptest" component={Mockuptest} />
      <Stack.Screen name="Congratulations" component={Congratulations} />
      <Stack.Screen name="Result" component={Result} />
      
      <Stack.Screen name="Recipient" component={Recipient} />
      <Stack.Screen name="ComingSoon" component={ComingSoon} />
      <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
      <Stack.Screen name="OTPScreen" component={OTPScreen} />
     
      
      <Stack.Screen name="HowToDo" component={HowToDo} />
      <Stack.Screen name="CarPadel" component={CarPadel} />
      <Stack.Screen name="AdjestingMirror" component={AdjestingMirror} />
      <Stack.Screen name="ParallelParking" component={ParallelParking} />
      <Stack.Screen name="ReverseParking" component={ReverseParking} />
      <Stack.Screen name="RoundAbout" component={RoundAbout} />
      <Stack.Screen name="Lparking" component={Lparking} />

      <Stack.Screen name="Language" component={Language} />

      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="Newpassword" component={Newpassword} />

      <Stack.Screen name="SignupScreen" component={SignupScreen} />

      {/* <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="OTPScreen" component={OTPScreen} /> */}
    </Stack.Navigator>
  );
};

export default AuthStack;

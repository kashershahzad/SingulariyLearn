import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import InboxScreen from '../screens/Main/Chat/InboxScreen';
import Notifications from '../screens/Main/Notifications';
import TabStack from './TabStack';
import HomeScreen from '../screens/Main/HomeScreen';
import DmvLicensesOnboading from '../screens/Main/DmvLicenses/DmvLicensesOnboading';
import ImmigrationOnBoading from '../screens/Main/Immigration/ImmigrationOnBoading';
import Immigration from '../screens/Main/Immigration';
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
import Mockuptest from '../screens/Main/dmvtest/mockuptest';
import Congratulations from '../screens/Main/dmvtest/Congratulations'
import UsefulKnowledge from '../screens/Main/dmvtest/UsefulKnowledge';
import PratiseQuestion from '../screens/Main/dmvtest/PratiseQuestion';
import Result from '../screens/Main/dmvtest/Result';
import Recipient from '../screens/Main/DmvLicenses/PermitType/Recipient';
import Notification from '../screens/Main/profileScreen/Notification';
import Language from '../screens/Auth/Language';
import EditProfile from '../screens/Main/profileScreen/EditProfile';
import HelpCenter from '../screens/Main/profileScreen/HelpCenter';
import ComingSoon from '../screens/Main/ComingSoon';
import FAQs from '../screens/Main/profileScreen/FAQs';
import API from '../screens/Main/api'
import ProfileScreen from '../screens/Main/profileScreen';
import Details from '../screens/Main/DmvLicenses/Details';

import StripeForm from '../screens/Main/DmvLicenses/PermitType/PaymentMethod/stripeform';
import Lessons from '../screens/Main/dmvtest/Lessons';
import LessonPage from '../screens/Main/dmvtest/LessonsPage';

const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator
    // initialRouteName='Lessons'
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="TabStack" component={TabStack} />
      <Stack.Screen name="DmvLicensesOnboading" component={DmvLicensesOnboading} />
      <Stack.Screen name="Immigration" component={Immigration} />
      <Stack.Screen name="ImmigrationOnBoading" component={ImmigrationOnBoading} />
      <Stack.Screen name="Language" component={Language} />
      

      {/* Permit */}
      <Stack.Screen name="PermitType" component={PermitType} />
      <Stack.Screen name="AdultPermit" component={AdultPermit} />
      <Stack.Screen name="SelectPackage" component={SelectPackage} />
      <Stack.Screen name="Checkout" component={Checkout} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethod} />
      <Stack.Screen name="AddAcc" component={AddAcc} />
      <Stack.Screen name="AddCard" component={AddCard} />
      <Stack.Screen name="Recipient" component={Recipient} />
      <Stack.Screen name="API" component={API} />

      <Stack.Screen name="ComingSoon" component={ComingSoon} />

      {/*  MOckup Test */}
      <Stack.Screen name="Mockuptest" component={Mockuptest} />
      <Stack.Screen name="PratiseQuestion" component={PratiseQuestion} />
       <Stack.Screen name="LessonPage" component={LessonPage} />
      <Stack.Screen name="Congratulations" component={Congratulations} />
      <Stack.Screen name="Result" component={Result} />

      <Stack.Screen name="UsefulKnowledge" component={UsefulKnowledge} />
      <Stack.Screen name="Lessons" component={Lessons} />
      <Stack.Screen name="HowToDo" component={HowToDo} />
      <Stack.Screen name="CarPadel" component={CarPadel} />
      <Stack.Screen name="AdjestingMirror" component={AdjestingMirror} />
      <Stack.Screen name="ParallelParking" component={ParallelParking} />
      <Stack.Screen name="ReverseParking" component={ReverseParking} />
      <Stack.Screen name="RoundAbout" component={RoundAbout} />
      <Stack.Screen name="Lparking" component={Lparking} />
      <Stack.Screen name="Details" component={Details} />

      <Stack.Screen name="StripeForm" component={StripeForm} />
      



      <Stack.Screen name="Notification" component={Notification} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="HelpCenter" component={HelpCenter} />
      <Stack.Screen name="FAQs" component={FAQs} />

      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />

    </Stack.Navigator>
  );
};

export default MainStack;

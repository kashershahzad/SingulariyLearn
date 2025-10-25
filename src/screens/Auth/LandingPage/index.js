import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Header from './Molecules/Header';
import Banner from './Molecules/Banner';
import GetStarted from './Molecules/GetStarted';
import Services from './Molecules/Services';
import Loginbanner from './Molecules/Loginbanner';
import Courses from './Molecules/Courses';
import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';
import CustomText from '../../../components/CustomText';

const LandingPage = ({navigation}) => {
  return (
    <ScreenWrapper
      scrollEnabled
      headerUnScrollable={() => <Header />}
      backgroundColor="white"
      footerUnScrollable={() => {
        return (
          <View style={{height: 64, backgroundColor: COLORS.btn, justifyContent:'center'}}>
            <CustomText
              label={'Singularity Technologies LLC'}
              fontFamily={fonts.jakartaSemiBold}
              fontSize={16}
              textAlign={'center'}
              color={COLORS.white}
              marginBottom={5}
            />
          </View>
        );
      }}>
      <View>
        <Banner />
        <GetStarted />
        {/* <Services/>
           <Loginbanner/> */}
        <Courses navigation={navigation}/>
      </View>
    </ScreenWrapper>
  );
};

export default LandingPage;

const styles = StyleSheet.create({});

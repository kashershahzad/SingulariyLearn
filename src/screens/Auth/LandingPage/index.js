import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '../../../components/ScreenWrapper'
import CustomText from '../../../components/CustomModal'
import Header from './Molecules/Header'
import Banner from './Molecules/Banner'
import GetStarted from './Molecules/GetStarted'
import Services from './Molecules/Services'
import Loginbanner from './Molecules/Loginbanner'


const LandingPage = () => {
  return (
    <ScreenWrapper
    scrollEnabled
    headerUnScrollable={()=>(<Header/>)}
    >
        <View>
           <Banner/> 
           <GetStarted/>
           <Services/>
           <Loginbanner/>
        </View>
    </ScreenWrapper>
  )
}

export default LandingPage

const styles = StyleSheet.create({})
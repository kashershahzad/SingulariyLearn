import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../../components/ScreenWrapper'
import Header from './Molecules/Header'
import Banner from '../../Auth/LandingPage/Molecules/Banner'
import Services from '../../Auth/LandingPage/Molecules/Services'



const HomeScreen = ({ navigation }) => {

    return (
      <ScreenWrapper
        scrollEnabled
        headerUnScrollable={() => (<Header />)}
      >
        <Banner />
        <Services />
      </ScreenWrapper>
    )
  }

  export default HomeScreen

  const styles = StyleSheet.create({})
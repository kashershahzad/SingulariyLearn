import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from './../../../components/ScreenWrapper'
import Header2 from '../DmvLicenses/Molecules/Header2'
import fonts from '../../../assets/fonts'
import CustomText from '../../../components/CustomText'
import TestOptions from './Molecules/TestOptions'
import { Images } from '../../../assets/images'
import { useTranslation } from 'react-i18next'

const DmvTest = ({navigation}) => {
  const { t } = useTranslation();
  
  const practiceMenuItems = [

    // {
    //   title: t('Lessons'),
    //   icon: Images.usefulknowledge,
    //   bgColor: "#0DC1BE",
    //   fnc: () => navigation.navigate('Lessons')
    // },
    {
      title: t('practiceQuestion'),
      icon: Images.pratisequestion,
      bgColor: "#4378DB",
      fnc: () => navigation.navigate('PratiseQuestion',{roadsign:false})
    },
    {
      title: t('mockupTest'),
      icon: Images.mockup,
      bgColor: "#FDCD55",
      fnc: () => navigation.navigate('Mockuptest')
    },
    {
      title: t('roadSigns'),
      icon: Images.road,
      bgColor: "#28A164",
      fnc: () => navigation.navigate('PratiseQuestion',{roadsign:true})
    },
    {
      title: t('Mockup Test Road Signs'),
      icon: Images.roadsigntest,
      bgColor: "#0298EF",
      fnc: () => navigation.navigate("Roadsign")
    },
    // {
    //   title: t('study'),
    //   icon: Images.study,
    //   bgColor: "#F35555",
    {
      title: t('testHistory'),
      icon: Images.test,
      bgColor: "#F38E55",
      fnc: () => navigation.navigate('Result')
    },
    {
      title: t('usefulKnowledge'),
      icon: Images.usefulknowledge,
      bgColor: "#0DC1BE",
      fnc: () => navigation.navigate('UsefulKnowledge')
    },

  ];

  return (
    <ScreenWrapper
      scrollEnabled
      headerUnScrollable={() => (<Header2 title={t('dmvTitle')} />)}
    >
      <CustomText 
        label={t('adultPermit')} 
        fontFamily={fonts.medium} 
        fontSize={24} 
        marginTop={5} 
        marginLeft={5} 
        marginBottom={7} 
      />
      
      <View style={styles.container}>
        {practiceMenuItems.map((item, i) => (
          <TestOptions 
            key={i} 
            title={item.title} 
            icon={item.icon} 
            fnc={item.fnc}  
            bg={item.bgColor}
          />
        ))}
      </View>
    </ScreenWrapper>
  )
}

export default DmvTest

const styles = StyleSheet.create({
  container: {
    gap: 10,
  }
})
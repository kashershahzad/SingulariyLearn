import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Svg, { Circle } from 'react-native-svg'
import ScreenWrapper from '../../../../components/ScreenWrapper'
import MockupHeader from '../Molecules/MockupHeader'
import { COLORS } from '../../../../utils/COLORS'
import CustomText from '../../../../components/CustomText'
import fonts from '../../../../assets/fonts'
import ImageFast from '../../../../components/ImageFast'
import { Images } from '../../../../assets/images'
import CustomButton from '../../../../components/CustomButton'
import { useTranslation } from 'react-i18next'

const CircularProgress = ({ percentage, size = 200, strokeWidth = 30 }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <View style={styles.progressContainer}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#D1D9E6E5"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#A2DC5F"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      <View style={styles.percentageContainer}>
        <CustomText
          label={`${percentage}%`}
          fontFamily={fonts.bold}
          fontSize={37}
          marginTop={13}
          textAlign={'center'}
        />
      </View>
    </View>
  )
}

const Congratulations = ({ navigation, route }) => {
  const { t } = useTranslation();
  
  const { 
    score = 0, 
    totalQuestions = 50, 
    averageTime = '00:00' 
  } = route.params || {};

  const percentage = totalQuestions > 0 
    ? Math.round((score / totalQuestions) * 100) 
    : 0;

  return (
    <ScreenWrapper
      scrollEnabled
      statusBarColor={COLORS.btn}
      backgroundColor={COLORS.btn}
      paddingHorizontal={0}
    >
      <MockupHeader />
      <View style={styles.container}>
        
        <CircularProgress percentage={percentage} />

        <CustomText
          label={percentage >= 70 ? t('Driving Test Passed') : t('Driving Test Failed')}
          fontFamily={fonts.medium}
          fontSize={24}
          textAlign={'center'}
          marginTop={30}
          color={percentage >= 70 ? COLORS.success : COLORS.error}
        />

        <View style={styles.min}>
          <View>
            <CustomText
              label={`${score}/${totalQuestions}`}
              fontFamily={fonts.semiBold}
              fontSize={20}
              textAlign={'center'}
              marginTop={30}
            />

            <CustomText
              label={t('resultsLabel')}
              fontFamily={fonts.regular}
              fontSize={16}
              textAlign={'center'}
            />
          </View>

          <View>
            <CustomText
               label={parseFloat(averageTime).toFixed(1) + ' sec'}
              fontFamily={fonts.semiBold}
              fontSize={20}
              textAlign={'center'}
              marginTop={30}
            />

            <CustomText
              label={t('Average Time ')}
              fontFamily={fonts.regular}
              fontSize={16}
              textAlign={'center'}
            />
          </View>
        </View>

        <CustomButton
          onPress={() => navigation.replace('Mockuptest')}
          width={318}
          height={52}
          title={t('startNewTestButton')}
          backgroundColor={COLORS.btn}
          fontSize={16}
          color={'white'}
          borderRadius={25}
          marginTop={40}
          fontFamily={fonts.regular}
        />

        <CustomButton
          onPress={() => navigation.navigate('Result', {
            score: score,
            totalQuestions: totalQuestions,
            averageTime: averageTime
          })}
          width={318}
          height={52}
          title={t('checkResultButton')}
          fontSize={16}
          color={'black'}
          borderRadius={25}
          marginTop={10}
          fontFamily={fonts.regular}
          borderWidth={1}
          borderColor={'#ECEFF3'}
          backgroundColor={'white'}
        />
      </View>
    </ScreenWrapper>
  )
}

export default Congratulations

const styles = StyleSheet.create({
  container: {
    height:1000 ,
    backgroundColor: 'white',
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    padding: 20,
    marginTop: -30,
    alignItems: 'center'
  },
  progressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  svg: {
    position: 'absolute',
  },
  percentageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 200,
  },
  icon: {
    height: 191,
    width: 191,
    position: 'absolute',
    top: 70,
    left: 80,
  },
  min: {
    flexDirection: 'row',
    gap: 80,
    justifyContent: 'center'
  }
})
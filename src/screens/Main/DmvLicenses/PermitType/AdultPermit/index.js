import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '../../../../../components/ScreenWrapper'
import Header2 from '../../Molecules/Header2'
import CustomText from '../../../../../components/CustomText'
import fonts from '../../../../../assets/fonts'
import InfoContainer from '../Molecules/InfoContainer'
import CustomButton from '../../../../../components/CustomButton'
import { COLORS } from '../../../../../utils/COLORS'
import { useTranslation } from 'react-i18next'

const AdultPermit = ({navigation}) => {
  const { t } = useTranslation();
  const driverServices = [
    {
      title: t('driveTestTitle'),
      desc: t('driveTestDesc')
    },
    {
      title: t('licensesTitle'),
      desc: t('licensesDesc')
    },
    {
      title: t('realIdTitle'),
      desc: t('realIdDesc')
    }
  ];
  return (
    <ScreenWrapper
    scrollEnabled
      headerUnScrollable={() => (<Header2 line={true} title={t('adultPermitTitle')} />)}
    >
      <CustomText label={t('adultPermitTitle')} fontFamily={fonts.medium} fontSize={20} marginTop={10} marginLeft={5} />

      <CustomText label={t('adultPermitDescription')} fontFamily={fonts.medium} fontSize={12} marginTop={10} marginLeft={5} color={'#00000080'} />

      {
        driverServices.map(((item, i) => (
          <InfoContainer key={i} title={item.title} desc={item.desc} />
        )))
      }

      <CustomButton
        onPress={() => { navigation.navigate('SelectPackage') }}
        title={t('buyButton')} marginTop={53} height={62} borderRadius={10} backgroundColor={COLORS.primaryColor4} />

    </ScreenWrapper>
  )
}

export default AdultPermit

const styles = StyleSheet.create({})
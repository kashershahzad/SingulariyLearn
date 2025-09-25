import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '../../../../components/ScreenWrapper'
import Header2 from '../../DmvLicenses/Molecules/Header2'
import Service from '../../DmvLicenses/Molecules/Service'
import { useTranslation } from 'react-i18next'

const UsefulKnowledge = () => {
   const { t } = useTranslation();
  
  return (
    <ScreenWrapper
    headerUnScrollable={()=>(<Header2 line={true} title={t('usefulKnowledge')}/>)}>
     <Service/>
    </ScreenWrapper>
  )
}

export default UsefulKnowledge

const styles = StyleSheet.create({})
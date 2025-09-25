import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '../../../components/ScreenWrapper'
import Header2 from '../DmvLicenses/Molecules/Header2'
import CustomText from '../../../components/CustomText'
import fonts from '../../../assets/fonts'
import { useTranslation } from 'react-i18next'
import PermitOption from '../DmvLicenses/Molecules/PermitOption'
import CustomButton from '../../../components/CustomButton'
import { COLORS } from '../../../utils/COLORS'

const Immigration = ({ navigation }) => {
  const [selectedIndex, setSelectedIndex] = useState(null)
  const { t } = useTranslation()
  
  const info = [
    {
      title: t('civicsPracticeTest'),
    },
    {
      title: t('interviewPractice'),
    },
    {
      title: t('mockInterviewMode'),
      fnc: () => navigation.navigate('Mockuptest')
    },
    {
      title: t('studyMaterials'),
    },
    {
      title: t('immigrationFAQs'),
    },
    {
      title: t('startPractice'),
    },
  ]

  return (
    <ScreenWrapper headerUnScrollable={() => (
      <Header2 line={true} title={t('immigrationTestPrep')} />
    )}>
      <CustomText
        label={t('chooseYourPermitType2')}
        fontFamily={fonts.medium}
        fontSize={16}
        marginTop={15}
        marginLeft={5}
        marginBottom={15}
      />

      <View style={styles.container}>
        {info.map((item, i) => (
          <PermitOption
            key={i}
            price={item.price}
            title={item.title}
            isSelected={selectedIndex === i}
            onPress={() => setSelectedIndex(i)}
          />
        ))}
      </View>

      <CustomButton
        disabled={selectedIndex === null}
        onPress={() => {
          const selectedItem = info[selectedIndex];
          selectedItem.fnc && selectedItem.fnc();
        }}
        title={t('continue2')}
        marginTop={53}
        height={62}
        borderRadius={10}
        backgroundColor={COLORS.primaryColor4}
      />
    </ScreenWrapper>
  )
}

export default Immigration

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5
  }
})
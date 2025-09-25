import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '../../../../../components/ScreenWrapper'
import Header2 from '../../Molecules/Header2'
import CustomInput from '../../../../../components/CustomInput'
import CustomButton from '../../../../../components/CustomButton'
import { COLORS } from '../../../../../utils/COLORS'
import fonts from '../../../../../assets/fonts'
import { useTranslation } from 'react-i18next'

const AddAcc = ({ navigation }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    bankName: '',
    accountNumber: '',
    swiftCode: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <ScreenWrapper
      paddingBottom={20}
      scrollEnabled
      headerUnScrollable={() => (<Header2 line={true} title={t('addNewAccountTitle')} />)}>
      <View style={{ marginTop: 20 }}>
        <CustomInput
          marginBottom={20}
          value={formData.fullName}
          onChangeText={(text) => handleInputChange('fullName', text)}
          withLabel={t('fullNameLabel')}
          height={54}
          borderColor={'#E7E7E7'}
        />

        <CustomInput
          marginBottom={20}
          value={formData.bankName}
          onChangeText={(text) => handleInputChange('bankName', text)}
          withLabel={t('bankNameLabel')}
          height={54}
          borderColor={'#E7E7E7'}
        />

        <CustomInput
          marginBottom={20}
          value={formData.accountNumber}
          onChangeText={(text) => handleInputChange('accountNumber', text)}
          withLabel={t('accountNumberLabel')}
          keyboardType={'numeric'}
          height={54}
          borderColor={'#E7E7E7'}
        />

        <CustomInput
          marginBottom={20}
          value={formData.swiftCode}
          onChangeText={(text) => handleInputChange('swiftCode', text)}
          withLabel={t('swiftCodeLabel')}
          keyboardType={'numeric'}
          height={54}
          borderColor={'#E7E7E7'}
        />
      </View>

      <CustomButton
        onPress={() => { navigation.navigate('AddCard'); }}
        title={t('addButton')}
        height={62}
        borderRadius={10}
        backgroundColor={COLORS.primaryColor4}
        fontSize={20}
        marginTop={120}
        fontFamily={fonts.jakartaSemiBold}
      />
    </ScreenWrapper>
  )
}

export default AddAcc

const styles = StyleSheet.create({})
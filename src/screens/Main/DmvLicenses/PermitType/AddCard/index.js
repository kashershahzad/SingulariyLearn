import { StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from '../../../../../components/ScreenWrapper';
import Header2 from '../../Molecules/Header2';
import { Images } from '../../../../../assets/images';
import ImageFast from '../../../../../components/ImageFast';
import CustomInput from '../../../../../components/CustomInput';
import { COLORS } from '../../../../../utils/COLORS';
import fonts from '../../../../../assets/fonts';
import CustomButton from '../../../../../components/CustomButton';
import { useTranslation } from 'react-i18next';

const AddCard = ({navigation}) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        fullName: '',
        cardNumber: '',
        bankName: '',
        expiryDate: '',
        cvv: ''
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
            headerUnScrollable={() => (<Header2 line={true} title={t('creditCardTitle')} />)}
        >
            <ImageFast
                source={Images.creditcard}
                resizeMode={'contain'}
                style={styles.icon}
            />

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
                    value={formData.cardNumber}
                    onChangeText={(text) => handleInputChange('cardNumber', text)}
                    withLabel={t('cardNumberLabel')}
                    keyboardType="numeric"
                    
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

                <View style={styles.row}>
                    <CustomInput
                        marginBottom={20}
                        value={formData.expiryDate}
                        onChangeText={(text) => handleInputChange('expiryDate', text)}
                        withLabel={t('expiryDateLabel')}
                        placeholder={t('expiryDatePlaceholder')}
                        width={'49%'}
                        height={54}
                        borderColor={'#E7E7E7'}
                    />
                    <CustomInput
                        marginBottom={20}
                        value={formData.cvv}
                        onChangeText={(text) => handleInputChange('cvv', text)}
                        withLabel={t('cvvLabel')}
                        keyboardType="numeric"
                        secureTextEntry={true}
                        maxLength={4}
                        width={'49%'}
                        height={54}
                        borderColor={'#E7E7E7'}
                    />
                </View>
            </View>

            <CustomButton
                onPress={()=>{navigation.navigate('Recipient')}}
                title={t('payButton')}
                marginTop={10}
                height={62}
                borderRadius={10}
                backgroundColor={COLORS.primaryColor4}
                fontSize={20}
                fontFamily={fonts.jakartaSemiBold}
            />
        </ScreenWrapper>
    );
};

export default AddCard;

const styles = StyleSheet.create({
    icon: {
        height: 181,
        width: 291,
        alignSelf: 'center',
        marginTop: 10,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    }
});
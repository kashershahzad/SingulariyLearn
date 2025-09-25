import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import ScreenWrapper from '../../../../../components/ScreenWrapper'
import Header2 from '../../Molecules/Header2'
import CustomText from '../../../../../components/CustomText'
import fonts from '../../../../../assets/fonts'
import CustomHorizontalLine from '../../../../../components/CustomHorizontalLine'
import CustomButton from '../../../../../components/CustomButton'
import { COLORS } from '../../../../../utils/COLORS'
import { useTranslation } from 'react-i18next';

const Checkout = ({ route, navigation }) => {
    const { selectedPackage } = route.params;
    const { title, price, description, vehicle, duration } = selectedPackage;
    const { t } = useTranslation();
    const numericPrice = parseInt(price.replace(/\D/g, ''), 10);

    return (
        <ScreenWrapper
            paddingBottom={20}
            headerUnScrollable={() => (<Header2 title={'Checkout'} />)}
            footerUnScrollable={() => (
                <View style={{ marginHorizontal: 16 }}>
                    <CustomButton
                        onPress={() => {
                            navigation.navigate('PaymentMethod', { price: numericPrice });
                        }}
                        title={'Pay'}
                        marginTop={53}
                        height={62}
                        borderRadius={10}
                        backgroundColor={COLORS.primaryColor4}
                        fontSize={20}
                        fontFamily={fonts.jakartaSemiBold}
                    />
                </View>)}
        >
            <View style={styles.container}>
                <View style={styles.head}>
                    <CustomText label={title} fontFamily={fonts.medium} fontSize={16} color={'white'} />
                    <CustomText color={'white'} label={price} fontFamily={fonts.semiBold} fontSize={20} />
                </View>
                <CustomText label={description} fontFamily={fonts.medium} fontSize={12} color={'white'} />

                <View style={styles.head}>
                    <CustomText marginTop={5} label={t('vehiclesText')} fontFamily={fonts.regular} fontSize={12} color={'white'} />

                    <CustomText marginTop={5} label={vehicle} fontFamily={fonts.regular} fontSize={12} color={'white'} />
                </View>

                <View style={styles.head}>
                    <CustomText marginTop={5} label={t('durationText')} fontFamily={fonts.regular} fontSize={12} color={'white'} />
                    <CustomText marginTop={5} label={duration} fontFamily={fonts.regular} fontSize={12} color={'white'} />
                </View>
            </View>
            <CustomHorizontalLine />
            <View style={styles.head}>
                <CustomText marginTop={5} label={t('idText')} fontFamily={fonts.regular} fontSize={14} />
                <CustomText marginTop={5} label={'#3748934'} fontFamily={fonts.regular} fontSize={14} />
            </View>

            <CustomHorizontalLine />
            <View style={styles.head}>
                <CustomText marginTop={5} label={t('feeText')} fontFamily={fonts.regular} fontSize={14} />
                <CustomText marginTop={5} label={'$20'} fontFamily={fonts.regular} fontSize={14} />
            </View>

            <CustomHorizontalLine />
            <View style={styles.head}>
                <CustomText marginTop={5} label={t('totalText')} fontFamily={fonts.regular} fontSize={14} />
                <CustomText marginTop={5} label={`${parseInt(price.replace(/\D/g, '')) + 20}`} fontFamily={fonts.regular} fontSize={14} />
            </View>
        </ScreenWrapper>
    )
}

export default Checkout

const styles = StyleSheet.create({
    container: {
        height: 185,
        borderColor: '#E3E3E3',
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: '#ED7D20'
    },
    head: {
        flexDirection: 'row',
        justifyContent: "space-between"
    }
})
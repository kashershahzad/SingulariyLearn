import { StyleSheet, Text, View, Alert } from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '../../../../../components/ScreenWrapper'
import Header2 from '../../Molecules/Header2'
import CustomText from '../../../../../components/CustomText'
import fonts from '../../../../../assets/fonts'
import ImageFast from '../../../../../components/ImageFast'
import { Images } from '../../../../../assets/images'
import CustomCheckBox from '../../../../../components/CustomCheckBox'
import CustomButton from '../../../../../components/CustomButton'
import { COLORS } from '../../../../../utils/COLORS'
import { useTranslation } from 'react-i18next'
import { ApiRequest } from '../../../../../services/ApiRequest'
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native'

const PaymentMethod = ({ navigation, route }) => {
    const { t } = useTranslation();
    const [selectedMethod, setSelectedMethod] = useState('')
    const [refreshing, setRefreshing] = useState(false)
    const { price } = route.params;

    const paymentMethods = [
        { id: 'debit', label: t('debitCardLabel'), icon: Images.debit },
        { id: 'paypal', label: t('paypalLabel'), icon: Images.paypal },
        { id: 'stripe', label: t('stripeLabel'), icon: Images.stripe },
        { id: 'bank', label: t('bankTransferLabel'), icon: Images.bank }
    ]

    const openPaymentSheet = async (paymentId) => {
        const { error } = await presentPaymentSheet();
        setRefreshing(false);

        if (error) {
            Alert.alert(`Error code: ${error.code}`, error.message);
        } else {
            console.log("paymentId---->", paymentId);
            completePayment(paymentId);
            Alert.alert("Success", "Your payment is confirmed!");
        }
    };

    const onPayPress = async () => {
        if (selectedMethod !== 'stripe') {
            Alert.alert('Error', 'Please select Stripe as payment method');
            return;
        }

        setRefreshing(true);

        try {
            const body = {
                type: 'payment_intent',
                amount: price
            };

            const response = await ApiRequest(body);

            console.log("Payment Intent Response:", response.data.result);


            const result = response.data.result;
            console.log("Payment Intent Result:", result);

            const { customer, ephemeralKey, paymentIntent, paymentIntent_id } = result;

            const { error } = await initPaymentSheet({
                customerId: customer,
                customerEphemeralKeySecret: ephemeralKey,
                paymentIntentClientSecret: paymentIntent,
                merchantDisplayName: "Dvm Permit Test",
                allowsDelayedPaymentMethods: false,
            });

            if (error) {
                setRefreshing(false);
            } else {
                openPaymentSheet(paymentIntent_id);
            }
        } catch (error) {
            setRefreshing(false);
            console.log("Payment error:", error);
        }


    };


    const completePayment = (paymentId) => {
        console.log("Payment completed:", paymentId);
    }


    return (
        <ScreenWrapper
            paddingBottom={20}
            headerUnScrollable={() => (<Header2 line={true} title={t('paymentMethodTitle')} />)}
            footerUnScrollable={() => (<CustomButton
                onPress={onPayPress}
                disabled={!selectedMethod || refreshing}
                title={refreshing ? t('processing') : t('payButton')}
                marginTop={53}
                width={338}
                height={62}
                borderRadius={10}
                backgroundColor={selectedMethod === 'stripe' ? COLORS.primaryColor4 : '#CCCCCC'}
                fontSize={20}
                fontFamily={fonts.jakartaSemiBold}
            />)}>
            <CustomText label={t('cardTitle')} fontFamily={fonts.medium} fontSize={20} marginTop={10} marginLeft={5} />

            {paymentMethods.map((method) => (
                <View key={method.id} style={styles.card}>
                    <View style={styles.mincard}>
                        <ImageFast
                            source={method.icon}
                            resizeMode={'contain'}
                            style={styles.icon}
                        />
                        <CustomText label={method.label} fontFamily={fonts.jakartaRegular} fontSize={16} />
                    </View>
                    <CustomCheckBox
                        onValueChange={(value) => setSelectedMethod(value ? method.id : '')}
                        value={selectedMethod === method.id}
                    />
                </View>
            ))}
            <CustomButton
                onPress={() => { navigation.navigate('AddAcc') }}
                title={t('addNewAccountButton')}
                marginTop={20}
                height={48}
                borderRadius={10}
                color={COLORS.primaryColor4}
                borderColor={'#ED7D20'}
                borderWidth={1}
                fontFamily={fonts.jakartaMedium}
                fontSize={16}
            />
        </ScreenWrapper>
    )
}

export default PaymentMethod

const styles = StyleSheet.create({
    card: {
        height: 48,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: '#E8E8E8',
        paddingLeft: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 5,
        marginTop: 10,
    },
    mincard: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center'
    },
    icon: {
        height: 24,
        width: 32
    },
})
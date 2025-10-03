import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import CustomText from '../../../../components/CustomText'
import fonts from '../../../../assets/fonts'
import { Images } from '../../../../assets/images'
import ImageFast from '../../../../components/ImageFast'
import { COLORS } from '../../../../utils/COLORS'
import { useNavigation, useIsFocused } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { ToastMessage } from '../../../../utils/ToastMessage'
import { setOnBoarding } from '../../../../store/reducer/onBoading'

const Services = () => {
    const dispatch = useDispatch()
    const onboadingstate = useSelector(state => state.OnBoarding.OnBoarding)
    const navigation = useNavigation()
    const { t } = useTranslation()
    const isFocused = useIsFocused()
    const [selectedIndex, setSelectedIndex] = useState(null)
    useEffect(() => {
        setSelectedIndex(null)
    }, [isFocused])

    const servicedata = [
        {
            title: t('dmvLicenses'),
            image: Images.immigration,
            function: () =>
                // {
                // if (onboadingstate === false) 
                //     { navigation.navigate('DmvLicensesOnboading'),
                //         dispatch(setOnBoarding(true)) 
                //     }
                //     else{
                //         navigation.navigate('PermitType')
                //     }
                // }
                navigation.navigate('PermitType')
        },
        {
            title: t('immigration'),
            image: Images.immigration,
            function: () => { navigation.navigate('Immigration') }
        },
        {
            title: t('realEstateAssistance'),
            image: Images.realstate,
            function: () => ToastMessage("Coming Soon")
        },
        {
            title: t('loans'),
            image: Images.loans,
            function: () => ToastMessage("Coming Soon")
        },
        {
            title: t('interpretation'),
            image: Images.interperation,
            function: () => ToastMessage("Coming Soon")
        },
        {
            title: t('taxation'),
            image: Images.taxation,
            function: () => ToastMessage("Coming Soon")
        },
        {
            title: t('insurance'),
            image: Images.insurance,
            function: () => ToastMessage("Coming Soon")
        },
        {
            title: t('remodelingConstruction'),
            image: Images.remodling,
            function: () => ToastMessage("Coming Soon")
        },
        {
            title: t('plumbingElectricalWork'),
            image: Images.plumbing,
            function: () => ToastMessage("Coming Soon")
        },
        {
            title: t('familyLaw'),
            image: Images.familylaw,
            function: () => ToastMessage("Coming Soon")
        },
        {
            title: t('careerCounseling'),
            image: Images.career,
            function: () => ToastMessage("Coming Soon")
        },
        {
            title: t('callCenters'),
            image: Images.callcenter,
            function: () => ToastMessage("Coming Soon")
        },
        {
            title: t('websiteDigitalMarketing'),
            image: Images.website,
            function: () => ToastMessage("Coming Soon")
        },
        {
            title: t('legalHelpInPakistan'),
            image: Images.legal,
            function: () => ToastMessage("Coming Soon")
        },
        {
            title: t('nadraNicop'),
            image: Images.nadra,
            function: () => ToastMessage("Coming Soon")
        },
        {
            title: t('groceryEatery'),
            image: Images.grocery,
            function: () => ToastMessage("Coming Soon")
        }
    ];
    return (
        <View >
            <CustomText label={t('services')} fontFamily={fonts.jakartaSemiBold} fontSize={20} marginTop={15} marginBottom={10} />

            <View style={styles.container}>
                {
                    servicedata.map(((item, i) => (
                        <TouchableOpacity
                            onPress={() => {
                                if (selectedIndex === i) {
                                    setSelectedIndex(null)
                                } else {
                                    setSelectedIndex(i)
                                    item.function()
                                }
                            }}
                            key={i}
                            style={[
                                styles.box,
                                selectedIndex === i ? styles.selectedBox : null
                            ]}
                        >
                            <ImageFast
                                source={item.image}
                                style={[
                                    styles.icon,
                                    selectedIndex === i ? styles.selectedIcon : null
                                ]}
                            />
                            <CustomText
                                label={item.title}
                                fontFamily={fonts.jakartaSemiBold}
                                fontSize={8}
                                marginTop={6}
                                textAlign={'center'}
                                color={selectedIndex === i ? COLORS.white : COLORS.black}
                            />
                        </TouchableOpacity>
                    )))
                }
            </View>
        </View>
    )
}

export default Services

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 3,
        justifyContent: 'center'
    },
    box: {
        height: 75,
        width: '24%',
        backgroundColor: COLORS.white,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderColor
    },
    selectedBox: {
        backgroundColor: COLORS.primaryColor4,
    },
    icon: {
        height: 19,
        width: 19,
    },
    selectedIcon: {
        tintColor: COLORS.white
    }
})
import { StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '../../../../components/ScreenWrapper'
import Header2 from '../Molecules/Header2'
import IndexBanner from '../Molecules/IndexBanner'
import PermitOption from '../Molecules/PermitOption'
import CustomText from '../../../../components/CustomText'
import fonts from '../../../../assets/fonts'
import CustomButton from '../../../../components/CustomButton'
import { COLORS } from '../../../../utils/COLORS'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

const PermitType = () => {
    const { t } = useTranslation()
    const navigation = useNavigation()
    const [selectedIndex, setSelectedIndex] = useState(null)

    const info = [
        {
            title: t('adultPermit'),
            price: '$400',
            border: true
        },
        {
            title: t('provisionalPermit'),
            price: '$250'
        },
        {
            title: t('motorcyclePermit'),
            price: '$100'
        },
        {
            title: t('commercialCLP'),
            price: '$600'
        },
    ]

    return (
        <ScreenWrapper
            headerUnScrollable={() => (
                <Header2 title={t('yourPermitType')} line={true} />
            )}>
            <IndexBanner />
            <CustomText 
                label={t('chooseYourPermitType')} 
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
                onPress={() => { navigation.navigate('SelectPackage') }}
                title={t('continue')} 
                marginTop={53}
                height={62} 
                borderRadius={10} 
                backgroundColor={COLORS.primaryColor4} 
            />
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5
    }
})

export default PermitType
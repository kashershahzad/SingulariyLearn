import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../components/CustomText'
import fonts from '../../../../assets/fonts'
import { COLORS } from '../../../../utils/COLORS'
import CustomButton from '../../../../components/CustomButton'
import ImageFast from '../../../../components/ImageFast'
import { Images } from '../../../../assets/images'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

const Loginbanner = () => {
    const navigation = useNavigation()
    const { t } = useTranslation()
    
    return (
        <View>
            <CustomText label={t('whyVConnectU')} fontFamily={fonts.jakartaSemiBold} fontSize={20} marginTop={10} />

            <CustomText label={t('vConnectUDescription')} fontFamily={fonts.jakartaRegular} fontSize={13} marginBottom={10} color={COLORS.gray} />

            <View style={styles.container}>
                <CustomButton title={t('letsGetStarted')} backgroundColor={COLORS.primaryColor4} height={34} width={116} alignSelf='start' fontSize={12} fontFamily={fonts.jakartaSemiBold} borderRadius={4} marginTop={5} onPress={()=>navigation.navigate('LoginScreen')}/>

                 <ImageFast source={Images.logo1} resizeMode={'contain'} style={styles.icon}  />
            </View>
        </View>
    )
}

export default Loginbanner

const styles = StyleSheet.create({
container:{
    flexDirection:'row',
    justifyContent:'space-between'
},
icon:{
    height: 88,
    width: 79,
}
})
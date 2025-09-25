import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../components/CustomText'
import fonts from '../../../../assets/fonts'
import CustomButton from '../../../../components/CustomButton'
import { COLORS } from '../../../../utils/COLORS'
import ImageFast from '../../../../components/ImageFast'
import { Images } from '../../../../assets/images'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'

const GetStarted = () => {
    const navigation = useNavigation()
    const { t } = useTranslation()
    
    return (
        <View>
            <CustomText label={t('guidanceTestPrep')} fontFamily={fonts.jakartaSemiBold} fontSize={22} width={250} marginTop={15} />
            <View style={styles.container}>
                <CustomButton  onPress={()=>{navigation.navigate('Language')}} title={t('login')} backgroundColor={COLORS.primaryColor4} height={34} width={90} alignSelf='start' fontSize={12} fontFamily={fonts.jakartaSemiBold} borderRadius={4} marginTop={20} />
                <ImageFast source={Images.bannerimage} resizeMode={'contain'} style={styles.icon}  />
            </View>
        </View>
    )
}

export default GetStarted

const styles = StyleSheet.create({
    container:{
        flexDirection:'row',
        justifyContent:'space-between',
    },
    icon:{
        height: 139,
        width: 196,
        marginTop:-33
    }
})
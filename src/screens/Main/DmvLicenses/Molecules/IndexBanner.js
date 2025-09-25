import { StyleSheet, View , Dimensions} from 'react-native'
import React from 'react'
import { COLORS } from '../../../../utils/COLORS'
import CustomText from '../../../../components/CustomText'
import fonts from '../../../../assets/fonts'
import ImageFast from '../../../../components/ImageFast'
import { Images } from '../../../../assets/images'
import { useTranslation } from 'react-i18next'
 const { width } = Dimensions.get('window');
const IndexBanner = () => {
   
    const { t } = useTranslation()
    return (
        <View style={styles.container}>
            <CustomText 
                label={t('letsStartWithVConnectU')} 
                fontFamily={fonts.jakartaExtraBold} 
                fontSize={22} 
                width={200} 
                color={'#ED7D20'} 
            />

            <ImageFast 
                source={Images.bannerCircle} 
                resizeMode={'contain'} 
                style={styles.icon} 
            />
            <ImageFast 
                source={Images.caricon} 
                resizeMode={'contain'} 
                style={styles.icon2} 
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        backgroundColor: COLORS.primaryColor3,
        borderRadius: 10,
        paddingTop: 15,
        paddingLeft: 20,
        height: 149,
        overflow: 'hidden',
    },
    icon: {
        height: 137,
        width: 137,
        position: 'absolute',
        left: width * 0.60,
        top: 20,
    },
    icon2: {
        height: 74,
        width: 155,
        position: 'absolute',
        left: width * 0.50,
        top: 60,
    }
})

export default IndexBanner
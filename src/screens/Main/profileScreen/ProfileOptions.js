import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ImageFast from '../../../components/ImageFast'
import CustomText from '../../../components/CustomText'
import fonts from '../../../assets/fonts'
import { Images } from '../../../assets/images'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { use } from 'react'

const ProfileOptions = ({navigation}) => {

    const { t } = useTranslation();
    
    const options = [
        {
            title: t("dmvTest"),
            image: Images.permit,
        },
        {
            title: t("immigration"),
            image: Images.immigrationicon
        },
        {
            title: t("drivingTest"),
            image: Images.permit
        }
    ]
    return (
        <>
            {
                options.map(((item, i) => (
                    <View key={i} style={styles.container}>
                        <ImageFast
                            source={item.image}
                            resizeMode={'contain'}
                            style={styles.icon}
                        />
                        <CustomText
                            fontSize={14}
                            marginTop={30}
                            fontFamily={fonts.medium}
                            label={item.title}
                        />
                    </View>
                )))
            }
        </>
    )
}

export default ProfileOptions

const styles = StyleSheet.create({
    container: {
        height: 127,
        width: '33%',
        borderRadius: 10,
        borderColor: '#E5E5E5',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon: {
        height: 30,
        width: 30,
    }
})
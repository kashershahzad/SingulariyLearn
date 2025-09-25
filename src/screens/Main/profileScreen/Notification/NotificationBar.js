import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ImageFast from '../../../../components/ImageFast'
import { Images } from '../../../../assets/images'
import CustomText from '../../../../components/CustomText'
import fonts from '../../../../assets/fonts'
import CustomHorizontalLine from '../../../../components/CustomHorizontalLine'
import { useTranslation } from 'react-i18next'

const NotificationBar = () => {
    const { t } = useTranslation()
    
    return (
        <View style={styles.container}>
            <View style={styles.mincontainer}>
                <View style={styles.img}>
                    <ImageFast
                        source={Images.driving2}
                        resizeMode={'contain'}
                        style={styles.icon}
                    />
                </View>
                <View style={styles.textContainer}>
                    <View style={styles.mainText}>
                        <CustomText
                            fontSize={15}
                            fontFamily={fonts.jakartaSemiBold}
                            label={t('drivingLicense')}
                        />
                        <CustomText
                            fontSize={12}
                            lineHeight={17}
                            fontFamily={fonts.jakartaRegular}
                            color={'#828588'}
                            label={t('notificationMessage')}
                            marginTop={3}
                        />
                    </View>
                    <CustomText
                        fontSize={12}
                        fontFamily={fonts.jakartaRegular}
                        color={'#828588'}
                        label={t('yesterday')}
                    />
                </View>
            </View>
            <CustomHorizontalLine height={1} />
            <ImageFast
                source={Images.unread}
                resizeMode={'contain'}
                style={styles.icon2}
            />
        </View>
    )
}

export default NotificationBar

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
    },
    mincontainer: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 10,
    },
    textContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    mainText: {
        flex: 1,
        marginRight: 10,
    },
    icon: {
        width: 22,
        height: 12,
    },
    img: {
        width: 48,
        height: 48,
        backgroundColor: '#FF8B49',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
    },
    icon2: {
        height: 8,
        width: 8,
        position: 'absolute',
        left: 35,
    }
})
import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Images } from '../../../../assets/images'
import ImageFast from '../../../../components/ImageFast'
import CustomText from '../../../../components/CustomText'
import fonts from '../../../../assets/fonts'
import CustomHorizontalLine from '../../../../components/CustomHorizontalLine'
import { useNavigation } from '@react-navigation/native'

const Header2 = ({ title, line }) => {
    const Navigation = useNavigation()
    return (
        <>
            <View style={styles.container}>
                <ImageFast
                    onPress={() => { Navigation.goBack() }}
                    source={Images.leftarrow}
                    resizeMode={'contain'}
                    style={styles.icon}
                />
                <View style={styles.titleContainer}>
                    <CustomText
                        fontSize={16}
                        fontFamily={fonts.jakartaSemiBold}
                        label={title}
                        style={styles.titleText}
                    />
                </View>
            </View>
            {
                line && <CustomHorizontalLine height={1}/>
            }
        </>
    )
}

export default Header2

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 15,
        paddingHorizontal: 15,
    },
    icon: {
        height: 24,
        width: 24
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -24,
    },
    titleText: {
        textAlign: 'center',
    }
})
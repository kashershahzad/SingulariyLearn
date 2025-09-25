import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ImageFast from '../../../../components/ImageFast'

const Banner2 = ({image}) => {
    return (
        <View style={styles.container}>
            <ImageFast
                source={{uri:image}}
                resizeMode={'contain'}
                style={styles.icon}
            />
        </View>
    )
}

export default Banner2

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D9D9D9',
        width: 375,
        height: 234,
        marginTop: 5,
    },
    icon: {
        width: 375,
        height: 234,
    }
})
import { StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { COLORS } from '../../../../utils/COLORS'
import { Images } from '../../../../assets/images'
import ImageFast from '../../../../components/ImageFast'
import fonts from '../../../../assets/fonts'
import CustomText from '../../../../components/CustomText'
import { useNavigation } from '@react-navigation/native'

const MockupHeader = ({ timercomplete, resettimer, setreset, timer, title }) => {
    const navigation = useNavigation()
    const [timeLeft, setTimeLeft] = useState(50)

    useEffect(() => {
        if (resettimer) {
            setTimeLeft(50)
            setreset(false)
            return
        }

        if (timeLeft === 0) {
             if (typeof timercomplete === 'function') {
                timercomplete(true)
            }
            return
        }

        const timerId = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1)
        }, 1000)

        return () => clearInterval(timerId)
    }, [timeLeft, resettimer])

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`
    }

    return (
        <View style={[styles.container, { justifyContent: timer ? 'space-between' : 'flex-start' }]}>
            <ImageFast
                onPress={() => navigation.goBack()}
                source={Images.leftarrow2}
                resizeMode={'contain'}
                style={styles.icon}
            />
            <CustomText
                label={title}
                fontFamily={fonts.regular}
                fontSize={20}
                color={'white'}
                style={timer ? null : { marginLeft: 20 }} // Add margin when timer is false
            />
            {
                timer &&
                <CustomText
                    label={formatTime(timeLeft)}
                    fontFamily={fonts.medium}
                    fontSize={16}
                    color={'white'}
                />
            }

        </View>
    )
}

export default MockupHeader

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.primaryColor4,
        height: 90,
        flexDirection: 'row',
        paddingTop: 20,
        paddingHorizontal: 16,
    },
    icon: {
        height: 25,
        width: 24
    }
})
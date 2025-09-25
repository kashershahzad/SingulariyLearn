import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Images } from '../../../../assets/images'
import ImageFast from '../../../../components/ImageFast'
import CustomText from '../../../../components/CustomText'
import fonts from '../../../../assets/fonts'
import CustomHorizontalLine from '../../../../components/CustomHorizontalLine'

const FaqSection = ({question, answere}) => {
    const [open, setopen] = useState(false)
    const modelopen = () => {
        if (open === true) {
            setopen(false)
        } else {
            setopen(true)
        }
    }
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={modelopen} style={[styles.mincontainer, open === true ? styles.open : null ]} >
                <CustomText
                    marginTop={5}
                    fontSize={14}
                    color={'black'}
                    fontFamily={fonts.medium}
                    label={question}
                />
                <ImageFast
                    source={Images.arrowdown}
                    resizeMode={'contain'}
                    style={styles.icon}
                />
            </TouchableOpacity>
            {
                open && <><CustomHorizontalLine height={1} />
                    <View style={styles.answere}>
                        <CustomText
                            marginTop={15}
                            fontSize={11}
                            color={'#888888'}
                            fontFamily={fonts.regular}
                            label={answere}
                        />
                    </View>
                </>
            }

        </View>
    )
}

export default FaqSection

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        padding: 20,
        paddingVertical: 14,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#EFEFEF',
        marginTop: 10,
    },
    mincontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    icon: {
        width: 24,
        height: 24
    },
    open:{
        marginBottom:10,
    }
})
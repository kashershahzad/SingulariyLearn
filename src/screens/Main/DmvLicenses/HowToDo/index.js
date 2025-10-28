import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../../../../components/ScreenWrapper'
import Header2 from '../Molecules/Header2'
import CustomHorizontalLine from '../../../../components/CustomHorizontalLine'
import CustomText from '../../../../components/CustomText'
import fonts from '../../../../assets/fonts'
import { Images } from '../../../../assets/images'
import ImageFast from '../../../../components/ImageFast'
import { COLORS } from '../../../../utils/COLORS'
import { useTranslation } from 'react-i18next'
import { ApiRequest } from '../../../../services/ApiRequest'
import { useSelector } from 'react-redux'
import Loading from '../../../../components/Loading'

const HowToDo = ({ navigation , route}) => {
    const currentLanguage = useSelector(state => state.language.language)
    const { t } = useTranslation()
    const [howtodo, sethowtodo] = useState([])
    const [loading, setLoading] = useState(true)

    const { cat_id, title } = route.params 


    useEffect(() => {
        const fetchData = async () => {
            try {
                const body = {
                    type: 'get_data',
                    table_name: 'useful_information',
                    cat_id:cat_id
                }
                console.log('kjnsd',body)
                const response = await ApiRequest(body)
                if (response.status === 200) {
                    console.log('useful_information', response.data)
                    const Rawdata = response.data.data

                    const pdata = Rawdata.map(item => ({
                        id: item.id.toString(),
                        title: JSON.parse(item.title)[currentLanguage],
                        cover_image: item.image,
                        cat_img: item.cat_img,
                        headline: JSON.parse(item.headline)[currentLanguage],
                        content: JSON.parse(item.editor_content)[currentLanguage],
                    }))
                    sethowtodo(pdata)
                    console.log("jdcn",pdata)
                } else {
                    console.log('Error in useful_information api')
                   
                }
            } catch (error) {
                console.log('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [currentLanguage])

    if (loading) {
        return <Loading />
    }

    return (
        <ScreenWrapper
            headerUnScrollable={() => (
                <Header2
                    title={title}
                    line='true'
                />
            )}>

            <CustomText
                marginTop={10}
                fontSize={16}
                fontFamily={fonts.medium}
                label={t('turnDoubtIntoPower')}
            />

            <FlatList
                data={howtodo}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.box2}
                        onPress={() => navigation.navigate('Details', { item })}
                    >
                        <ImageFast
                            source={{ uri: item.cat_img }}
                            resizeMode={'contain'}
                            style={styles.icon}
                        />
                        <View style={styles.row}>
                            <CustomText
                                marginTop={5}
                                fontSize={12}
                                color={'black'}
                                fontFamily={fonts.medium}
                                label={item.title}
                                numberOfLines={2}
                            />
                            <ImageFast
                                source={Images.arrowup2}
                                resizeMode={'contain'}
                                style={styles.icon2}
                            />
                        </View>
                    </TouchableOpacity>
                )} 
            />

        </ScreenWrapper>
    )
}

export default HowToDo

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 5,
    },
    listContent: {
        padding: 5,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    box2: {
        width: '49%',
        borderColor: '#F1F1F1',
        borderRadius: 10,
        borderWidth: 2,
        marginBottom: 10,
        borderTopWidth: 0,
    },
    icon: {
        width: '100%',
        height: 122,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    row: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
    },
    icon2: {
        height: 20,
        width: 20,
    },
})
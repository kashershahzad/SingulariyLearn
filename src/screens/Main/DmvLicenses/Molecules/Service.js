import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, {useState , useEffect} from 'react'
import CustomText from '../../../../components/CustomText'
import fonts from '../../../../assets/fonts'
import { Images } from '../../../../assets/images'
import { useNavigation } from '@react-navigation/native'
import ImageFast from '../../../../components/ImageFast'
import { useTranslation } from 'react-i18next'
import Loading from '../../../../components/Loading'
import {ApiRequest} from '../../../../services/ApiRequest'
import { useSelector } from 'react-redux'

const Service = () => {
    const navigation = useNavigation()
    const { t } = useTranslation()
    const [service, setService] = useState([])
    const [loading, setLoading] = useState(true)
    const currentLanguage = useSelector(state => state.language.language)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const body = {
                    type: 'get_data',
                    table_name: 'categories_useful'
                }
                const response = await ApiRequest(body)
                if (response.status === 200) {
                    console.log('catagories', response.data)
                    
                    // Fixed: Access the data array directly from response.data
                    const Rawdata = response.data?.data || []
                    
                    // Add a check to ensure Rawdata is an array
                    if (!Array.isArray(Rawdata)) {
                        console.log('Rawdata is not an array:', Rawdata)
                        setService([])
                        return
                    }

                    const pdata = Rawdata.map(item => ({
                        id: item.id.toString(),
                        title: JSON.parse(item.title)[currentLanguage],
                        image: item.thumb, // Using thumb URL from API
                        cat_img: item.cat_img,
                        headline: JSON.parse(item.headline || '{}')[currentLanguage] || '',
                        content: JSON.parse(item.editor_content || '{}')[currentLanguage] || '',
                    }))
                    setService(pdata)
                    
                    // Fixed: Proper logging to check images
                    console.log("Processed data:", pdata)
                    pdata.forEach((item, index) => {
                        console.log(`Item ${index} image:`, item.image)
                    })
                } else {
                    console.log('Error in catagories api')
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
        <View>
            <View style={styles.container}>
                {service.map((item, i) => (
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('HowToDo', { cat_id: item.id, title: item.title })} 
                        key={i} 
                        style={styles.box}
                    >
                        <ImageFast 
                            source={{ uri: item.image }} // Make sure to use { uri: } for remote images
                            resizeMode={'contain'} 
                            style={styles.icon2} 
                        />
                        <CustomText 
                            label={item.title} 
                            fontFamily={fonts.medium} 
                            fontSize={11} 
                            color={'black'} 
                        />
                        <ImageFast 
                            source={Images.servicelogo} 
                            resizeMode={'contain'} 
                            style={styles.icon} 
                        />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

export default Service

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 5,
        flexWrap: 'wrap',
        marginTop: 20,
    },
    box: {
        height: 103,
        width: "32%",
        backgroundColor: '#9CDBFF',
        borderRadius: 10,
        opacity: 0.8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon: {
        width: 63,
        height: 72,
        position: 'absolute',
        top: 25,
        left: "45%",
    },
    icon2: {
        width: 40,
        height: 40,
    }
})
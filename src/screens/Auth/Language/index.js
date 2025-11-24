import { StyleSheet, View, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import ImageFast from '../../../components/ImageFast';
import { Images } from '../../../assets/images';
import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import CustomButton from '../../../components/CustomButton';
import { COLORS } from '../../../utils/COLORS';
import { ApiRequest } from '../../../services/ApiRequest'
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../../../store/reducer/LanguageConfig';
import Loading from '../../../components/Loading';

const Language = ({ navigation, route}) => {
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(false);
    const currentLanguage = useSelector((state) => state.language.language);
    const {ProfileScreen} = route.params || {};
    console.log("ProfileScreen",ProfileScreen)

    useEffect(() => { 
        const fetchLanguage = async () => {
            setLoading(true);
            try {
                const body = {
                    type: 'get_data',
                    table_name: 'languages',
                }
                const result = await ApiRequest(body);
                setLanguages(result.data.data);
            } catch (error) {
                console.error('Error fetching languages:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchLanguage();
        
    }, []);

    const handlePress = (languageCode) => {
        dispatch(setLanguage(languageCode));
        i18n.changeLanguage(languageCode);
        if(ProfileScreen === true){
            navigation.goBack();
        }else{
            navigation.navigate("LoginScreen");
        }
        
    };

    const getButtonStyle = (languageCode) => {
        return currentLanguage === languageCode
            ? { backgroundColor: COLORS.btn, color: COLORS.white }
            : { backgroundColor: COLORS.bggray, color: COLORS.black };
    };

    return (
        <ScreenWrapper>
            {loading ? (
                <Loading/>
            ) : (
                <>
                    <ImageFast
                        source={Images.leftarrow}
                        resizeMode={'contain'}
                        style={styles.icon}
                        onPress={() => navigation.goBack()}
                    />
                    <CustomText
                        label={t('select_language')}
                        fontFamily={fonts.semiBold}
                        fontSize={28}
                        marginTop={40}
                        marginBottom={20}
                    />
                    {languages?.map((item) => (
                        <CustomButton
                            key={item.lang_code}
                            onPress={() => handlePress(item.lang_code)}
                            title={item.language}
                            backgroundColor={getButtonStyle(item.lang_code).backgroundColor}
                            height={52}
                            alignSelf='stretch'
                            fontSize={16}
                            fontFamily={fonts.regular}
                            borderRadius={25}
                            marginTop={10}
                            color={getButtonStyle(item.lang_code).color}
                        />
                    ))}
                </>
            )}
        </ScreenWrapper>
    );
};

export default Language;

const styles = StyleSheet.create({
    icon: {
        height: 24,
        width: 24,
        marginTop: 70,
        marginLeft: 10
    }
});
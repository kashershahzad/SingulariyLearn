import { StatusBar, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from '../../../../components/CustomText';
import fonts from '../../../../assets/fonts';
import { COLORS } from '../../../../utils/COLORS';
import { Images } from '../../../../assets/images';
import { useFocusEffect } from '@react-navigation/native';
import ImageFast from '../../../../components/ImageFast';
import { useTranslation } from 'react-i18next';

const DmvLicensesOnboading = ({ navigation }) => {
    const { t } = useTranslation();

    useFocusEffect(
        React.useCallback(() => {
            StatusBar.setHidden(true);
            return () => {
                StatusBar.setHidden(false);
            };
        }, [])
    );

    const onboardingMessages = [
        t('prepareDMV'),
        t('aceDMV'),
        t('allPractice')
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    const goToNextSlide = () => {
        if (currentIndex === onboardingMessages.length - 1) {
            navigation.replace('PermitType');
        } else {
            setCurrentIndex((prevIndex) => prevIndex + 1);
        }
    };

    return (
        < >
            <StatusBar hidden />
            <LinearGradient
                colors={['#ED7D2080', '#F4AE7333', '#FFFFFF00']}
                locations={[0, 0.3, 1]}
                style={styles.container}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            >
                <View style={{paddingHorizontal:20}}>
                <CustomText
                    textAlign={'right'}
                    marginTop={50}
                    fontFamily={fonts.semiBold}
                    fontSize={14}
                    label={t('skip')}
                    onPress={() => { navigation.navigate('PermitType') }}
                />

                <CustomText
                    marginTop={140}
                    fontSize={26}
                    textAlign={'center'}
                    fontFamily={fonts.jakartaSemiBold}
                    label={onboardingMessages[currentIndex]}
                />

                <View style={styles.row}>
                    {onboardingMessages.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.circle,
                                {
                                    backgroundColor: index === currentIndex
                                        ? COLORS.primaryColor4
                                        : '#D9D9D9'
                                }
                            ]}
                        />
                    ))}
                </View>

                <ImageFast
                    source={Images.onboardingarrow}
                    resizeMode={'contain'}
                    style={styles.icon}
                    onPress={goToNextSlide}
                />

                <ImageFast source={Images.onboarding} resizeMode={'contain'} style={styles.icon2} />
                </View>
            </LinearGradient>
        </>
    );
};

export default DmvLicensesOnboading;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        gap: 5,
        justifyContent: 'center',
        marginTop: 15,
    },
    circle: {
        height: 14,
        width: 14,
        borderRadius: 50,
    },
    icon: {
        height: 54,
        width: 54,
        alignSelf: 'center',
        marginTop: 30,
    },
    icon2: {
        height: 287,
        width: 299,
        alignSelf: 'center',
        marginTop: 30,
    }
});
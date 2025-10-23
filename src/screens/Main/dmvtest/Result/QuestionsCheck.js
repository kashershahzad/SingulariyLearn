import { StyleSheet, View } from 'react-native';
import React from 'react';
import fonts from '../../../../assets/fonts';
import CustomText from '../../../../components/CustomText';
import ImageFast from '../../../../components/ImageFast';
import { Images } from '../../../../assets/images';
import { COLORS } from '../../../../utils/COLORS';
import { useTranslation } from 'react-i18next';

const QuestionsCheck = () => {
    const { t } = useTranslation();
    const testQuestions = t('testQuestions2', { returnObjects: true });
    
    const Answers = [
        { number: '1', result: Images.correct, ...testQuestions[0] },
        { number: '2', result: Images.wrong, ...testQuestions[1] },
        { number: '3', result: Images.correct, ...testQuestions[2] },
        { number: '4', result: Images.correct, ...testQuestions[3] },
        { number: '5', result: Images.wrong, ...testQuestions[4] }
    ];

    return (
        <View>
            <CustomText
                label={t('yourAnswers')}
                fontFamily={fonts.medium}
                fontSize={14}
                marginTop={10}
            />
            {Answers.map((item, index) => (
                <View key={index} style={styles.container}>
                    <View style={styles.mincontainer}>
                        <CustomText
                            label={`${item.number}/5`}
                            fontFamily={fonts.medium}
                            fontSize={12}
                            color={COLORS.btn}
                        />
                        <ImageFast
                            source={item.result}
                            resizeMode={'contain'}
                            style={styles.icon}
                        />
                    </View>
                    <CustomText
                        label={item.question}
                        fontFamily={fonts.medium}
                        fontSize={14}
                        marginTop={6}
                    />
                    <CustomText
                        label={item.answer}
                        fontFamily={fonts.medium}
                        fontSize={12}
                        marginTop={6}
                        color={'#4F4F4F'}
                    />
                </View>
            ))}
        </View>
    );
};

export default QuestionsCheck;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        height: 117,
        borderWidth: 1,
        borderColor: '#EBEBEB',
        marginTop: 5,
        borderRadius: 8,
        paddingVertical: 15,
        marginBottom: 10
    },
    mincontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    icon: {
        width: 67,
        height: 23,
    },
});
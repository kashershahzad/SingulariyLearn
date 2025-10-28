import { StyleSheet, View } from 'react-native';
import React from 'react';
import fonts from '../../../../assets/fonts';
import CustomText from '../../../../components/CustomText';
import ImageFast from '../../../../components/ImageFast';
import { Images } from '../../../../assets/images';
import { COLORS } from '../../../../utils/COLORS';
import { useTranslation } from 'react-i18next';

const QuestionsCheck = ({ currentAttemptData }) => {
    const { t } = useTranslation();
    
    // Parse questions from JSON string
    const getQuestionsData = () => {
        if (!currentAttemptData || !currentAttemptData.questions) return [];
        
        try {
            // Parse the JSON string to array
            const questionsString = currentAttemptData.questions;
            const parsedQuestions = JSON.parse(questionsString);
            
            console.log('📋 Parsed Questions:', parsedQuestions);
            console.log('📊 Type:', typeof parsedQuestions);
            console.log('🔢 Length:', parsedQuestions?.length);
            
            return Array.isArray(parsedQuestions) ? parsedQuestions : [];
        } catch (error) {
            console.error('❌ Error parsing questions:', error);
            return [];
        }
    };
    
    const questions = getQuestionsData();

    // If no questions data, show a message
    if (!questions || questions.length === 0) {
        return (
            <View>
                <CustomText
                    label={t('yourAnswers')}
                    fontFamily={fonts.medium}
                    fontSize={14}
                    marginTop={10}
                />
                <View style={styles.container}>
                    <CustomText
                        label="No questions data available for this attempt"
                        fontFamily={fonts.medium}
                        fontSize={12}
                        color={COLORS.gray}
                        textAlign="center"
                    />
                </View>
            </View>
        );
    }

    return (
        <View>
            <CustomText
                label={t('yourAnswers')}
                fontFamily={fonts.medium}
                fontSize={14}
                marginTop={10}
            />
            {questions.map((item, index) => (
                <QuestionItem 
                    key={item.question_id || index} 
                    item={item} 
                    index={index} 
                    totalQuestions={questions.length} 
                />
            ))}
        </View>
    );
};

// Separate component for each question item
const QuestionItem = ({ item, index, totalQuestions }) => {
    const wasSkipped = item.skipped === 1 || item.skiped === 1 || item.selected_option === null;
    const isCorrect = item.is_correct === true;
    
    return (
        <View style={styles.container}>
            <View style={styles.mincontainer}>
                <CustomText
                    label={`${index + 1}/${totalQuestions}`}
                    fontFamily={fonts.medium}
                    fontSize={12}
                    color={COLORS.btn}
                />
                <ImageFast
                    source={wasSkipped ? Images.skipped : (isCorrect ? Images.correct : Images.wrong)}
                    resizeMode={'contain'}
                    style={styles.icon}
                />
            </View>
            
            {/* Question Text */}
            <CustomText
                label={item.question_text || `Question ${item.question_id}`}
                fontFamily={fonts.medium}
                fontSize={14}
                marginTop={6}
            />
            
            {/* Selected Answer - Show only if not skipped */}
            {!wasSkipped && item.selected_answer_text && (
                <CustomText
                    label={`${item.selected_answer_text}`}
                    fontFamily={fonts.medium}
                    fontSize={12}
                    marginTop={6}
                    color={isCorrect ? "green": "red"}
                />
            )}
            
            {/* Show "Skipped" text for skipped questions */}
            {wasSkipped && (
                <CustomText
                    label="Skipped"
                    fontFamily={fonts.medium}
                    fontSize={12}
                    marginTop={6}
                    color={"gray"}
                />
            )}
        </View>
    );
};

export default QuestionsCheck;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        minHeight: 117,
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
import {StyleSheet, View} from 'react-native';
import React from 'react';
import fonts from '../../../../assets/fonts';
import CustomText from '../../../../components/CustomText';
import ImageFast from '../../../../components/ImageFast';
import {Images} from '../../../../assets/images';
import {useTranslation} from 'react-i18next';
import {useTheme, useThemedStyles} from '../../../../theme/useTheme';

const QuestionsCheck = ({currentAttemptData}) => {
  const {t} = useTranslation();
  const {colors} = useTheme();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
      emptyCard: {
        paddingHorizontal: 10,
        minHeight: 80,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: c.card,
        marginTop: 5,
        borderRadius: 8,
        paddingVertical: 15,
        marginBottom: 10,
        justifyContent: 'center',
      },
    }),
  );

  const getQuestionsData = () => {
    if (!currentAttemptData || !currentAttemptData.questions) {
      return [];
    }

    try {
      const questionsString = currentAttemptData.questions;
      const parsedQuestions = JSON.parse(questionsString);
      return Array.isArray(parsedQuestions) ? parsedQuestions : [];
    } catch (error) {
      console.error('Error parsing questions:', error);
      return [];
    }
  };

  const questions = getQuestionsData();

  if (!questions || questions.length === 0) {
    return (
      <View>
        <CustomText
          label={t('yourAnswers')}
          fontFamily={fonts.medium}
          fontSize={14}
          marginTop={10}
          color={colors.textPrimary}
        />
        <View style={styles.emptyCard}>
          <CustomText
            label="No questions data available for this attempt"
            fontFamily={fonts.medium}
            fontSize={12}
            color={colors.textMuted}
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
        color={colors.textPrimary}
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

const QuestionItem = ({item, index, totalQuestions}) => {
  const {colors} = useTheme();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
      container: {
        paddingHorizontal: 10,
        minHeight: 117,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: c.card,
        marginTop: 5,
        borderRadius: 8,
        paddingVertical: 15,
        marginBottom: 10,
      },
      mincontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
      icon: {
        width: 67,
        height: 23,
      },
    }),
  );

  const wasSkipped =
    item.skipped === 1 || item.skiped === 1 || item.selected_option === null;
  const isCorrect = item.is_correct === true;

  return (
    <View style={styles.container}>
      <View style={styles.mincontainer}>
        <CustomText
          label={`${index + 1}/${totalQuestions}`}
          fontFamily={fonts.medium}
          fontSize={12}
          color={colors.accent}
          removeTranslation
        />
        <ImageFast
          source={
            wasSkipped
              ? Images.skipped
              : isCorrect
                ? Images.correct
                : Images.wrong
          }
          resizeMode={'contain'}
          style={styles.icon}
        />
      </View>

      <CustomText
        label={item.question_text || `Question ${item.question_id}`}
        fontFamily={fonts.medium}
        fontSize={14}
        marginTop={6}
        color={colors.textPrimary}
        removeTranslation
      />

      {!wasSkipped && item.selected_answer_text && (
        <CustomText
          label={`${item.selected_answer_text}`}
          fontFamily={fonts.medium}
          fontSize={12}
          marginTop={6}
          color={isCorrect ? colors.correct : colors.wrong}
          removeTranslation
        />
      )}

      {wasSkipped && (
        <CustomText
          label="Skipped"
          fontFamily={fonts.medium}
          fontSize={12}
          marginTop={6}
          color={colors.textMuted}
        />
      )}
    </View>
  );
};

export default QuestionsCheck;

import {StyleSheet, View} from 'react-native';
import React from 'react';
import CustomText from '../../../../components/CustomText';
import fonts from '../../../../assets/fonts';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../../../../theme/useTheme';

const ResultsStats = ({currentAttemptData}) => {
  const {t} = useTranslation();
  const {colors} = useTheme();
  const stats = t('statsTitles', {returnObjects: true});

  const total = currentAttemptData?.question_data?.total || 0;
  const correct = currentAttemptData?.question_data?.correct || 0;
  const skipped = currentAttemptData?.question_data?.skipped || 0;
  const percentage = currentAttemptData?.percentage || 0;

  const questionsDone = total - skipped;
  const totalMarks = total;
  const obtainedMarks = correct;

  const isPassed = percentage >= 80;
  const status = isPassed ? t('Passed') : t('Failed');
  const statusColor = isPassed ? colors.correct : colors.wrong;

  const tableinfo = [
    {title: stats.questionsCount, result: total},
    {title: stats.questionsDone, result: questionsDone},
    {title: stats.totalMarks, result: totalMarks},
    {title: stats.obtainedMarks, result: obtainedMarks},
    {title: stats.percentage, result: `${percentage}%`},
  ];

  if (!currentAttemptData) {
    return (
      <View style={styles.emptyContainer}>
        <CustomText
          label={t('noDataAvailable') || 'No data available'}
          fontFamily={fonts.regular}
          fontSize={14}
          textAlign={'center'}
          color={colors.textMuted}
        />
      </View>
    );
  }

  return (
    <View>
      {tableinfo.map((item, i) => (
        <View key={i} style={styles.container}>
          <CustomText
            label={item.title}
            fontFamily={fonts.regular}
            fontSize={14}
            marginTop={5}
            color={colors.textPrimary}
          />
          <CustomText
            label={String(item.result)}
            fontFamily={fonts.semiBold}
            fontSize={14}
            marginTop={5}
            color={colors.accent}
            removeTranslation
          />
        </View>
      ))}

      <View style={styles.container}>
        <CustomText
          label={stats.status}
          fontFamily={fonts.regular}
          fontSize={14}
          marginTop={5}
          color={colors.textPrimary}
        />
        <CustomText
          label={status}
          fontFamily={fonts.bold}
          fontSize={16}
          marginTop={5}
          color={statusColor}
        />
      </View>
    </View>
  );
};

export default ResultsStats;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

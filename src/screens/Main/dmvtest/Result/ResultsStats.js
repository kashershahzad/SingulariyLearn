import { StyleSheet, View } from 'react-native';
import React,{useEffect} from 'react';
import CustomText from '../../../../components/CustomText';
import fonts from '../../../../assets/fonts';
import { COLORS } from '../../../../utils/COLORS';
import { useTranslation } from 'react-i18next';

const ResultsStats = ({ currentAttemptData }) => {
    const { t } = useTranslation();
    const stats = t('statsTitles', { returnObjects: true });

    useEffect(() => {
        // console.log('currentAttemptData updated:', currentAttemptData);
        // console.log('Question data:', currentAttemptData?.question_data);
        // console.log('Percentage:', currentAttemptData?.percentage);
    }, [currentAttemptData]);
    
    
    // Extract data from currentAttemptData
    const total = currentAttemptData?.question_data?.total || 0;
    const correct = currentAttemptData?.question_data?.correct || 0;
    const skipped = currentAttemptData?.question_data?.skipped || 0;
    const percentage = currentAttemptData?.percentage || 0;
    
    // Calculate questions done (total - skipped)
    const questionsDone = total - skipped;
    
    // Calculate marks (assuming each question is worth 1 mark)
    const totalMarks = total;
    const obtainedMarks = correct;
    
    // Determine status based on percentage (assuming 50% is passing)
    const isPassed = percentage >= 80;
    const status = isPassed ? t('Passed') : t('Failed');
    const statusColor = isPassed ? '#00B35D' : '#FF0000';
    
    const tableinfo = [
        { title: stats.questionsCount, result: total },
        { title: stats.questionsDone, result: questionsDone },
        { title: stats.totalMarks, result: totalMarks },
        { title: stats.obtainedMarks, result: obtainedMarks },
        { title: stats.percentage, result: `${percentage}%` }
    ];

    // Show loading or empty state if no data
    if (!currentAttemptData) {
        return (
            <View style={styles.emptyContainer}>
                <CustomText
                    label={t('noDataAvailable') || 'No data available'}
                    fontFamily={fonts.regular}
                    fontSize={14}
                    textAlign={'center'}
                    color={COLORS.gray}
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
                    />
                    <CustomText
                        label={item.result}
                        fontFamily={fonts.semiBold}
                        fontSize={14}
                        marginTop={5}
                        color={COLORS.btn}
                    />
                </View>
            ))}

            <View style={styles.container}>
                <CustomText
                    label={stats.status}
                    fontFamily={fonts.regular}
                    fontSize={14}
                    marginTop={5}
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
    }
});
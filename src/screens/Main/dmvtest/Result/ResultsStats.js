import { StyleSheet, View } from 'react-native';
import React from 'react';
import CustomText from '../../../../components/CustomText';
import fonts from '../../../../assets/fonts';
import { COLORS } from '../../../../utils/COLORS';
import { useTranslation } from 'react-i18next';

const ResultsStats = () => {
    const { t } = useTranslation();
    const stats = t('statsTitles', { returnObjects: true });
    
    const tableinfo = [
        { title: stats.questionsCount, result: 210 },
        { title: stats.questionsDone, result: 105 },
        { title: stats.totalMarks, result: 300 },
        { title: stats.obtainedMarks, result: 255 },
        { title: stats.percentage, result: '78%' }
    ];

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
                        color={COLORS.primaryColor4}
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
                    label={t('statusPassed')}
                    fontFamily={fonts.bold}
                    fontSize={16}
                    marginTop={5}
                    color={'#00B35D'}
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
    }
});
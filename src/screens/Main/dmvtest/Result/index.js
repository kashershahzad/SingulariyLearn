import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import MockupHeader from '../Molecules/MockupHeader';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import ImageFast from '../../../../components/ImageFast';
import {Images} from '../../../../assets/images';
import fonts from '../../../../assets/fonts';
import CustomText from '../../../../components/CustomText';
import Resultbtn from './Resultbtn';
import ResultsStats from './ResultsStats';
import QuestionsCheck from './QuestionsCheck';
import {useTranslation} from 'react-i18next';
import {ApiRequest} from '../../../../services/ApiRequest';
import {useSelector} from 'react-redux';
import Loading from '../../../../components/Loading';
import {useTheme, useThemedStyles} from '../../../../theme/useTheme';

const Result = () => {
  const {t} = useTranslation();
  const {colors} = useTheme();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: c.screenBg,
        borderTopLeftRadius: 45,
        borderTopRightRadius: 45,
        padding: 20,
        marginTop: -30,
        paddingBottom: 40,
      },
      icon: {
        height: 231,
        width: '100%',
        alignSelf: 'center',
      },
      noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
    }),
  );

  const token = useSelector(state => state.authConfig.token);
  const currentLanguage = useSelector(state => state.language.language);

  const [totalAttempts, setTotalAttempts] = useState(0);
  const [resultsData, setResultsData] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [currentAttemptData, setCurrentAttemptData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchresult = async () => {
      try {
        setLoading(true);
        const body = {
          type: 'get_data',
          table_name: 'user_questionnaire',
          user_id: token,
          limit: 1000,
        };

        const response = await ApiRequest(body);
        const rawResponse = response.data;

        if (!rawResponse?.data || rawResponse?.data?.length === 0) {
          setTotalAttempts(0);
          setResultsData([]);
          setCurrentAttemptData(null);
          setLoading(false);
          return;
        }

        const totalAttemptsCount = rawResponse.data.length;
        setTotalAttempts(totalAttemptsCount);
        setResultsData(rawResponse.data);

        if (totalAttemptsCount > 0) {
          setCurrentAttempt(totalAttemptsCount);
          const latestAttemptData =
            rawResponse.data[rawResponse.data.length - 1];
          setCurrentAttemptData(latestAttemptData);
        } else {
          setCurrentAttemptData(null);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchresult();
  }, [token, currentLanguage]);

  const handleAttemptChange = attemptId => {
    const attemptIndex = resultsData.length - attemptId;
    const attemptData = resultsData[attemptIndex];
    setCurrentAttempt(attemptId);
    setCurrentAttemptData(attemptData);
  };

  const screenProps = {
    statusBarColor: colors.accent,
    backgroundColor: colors.accent,
    paddingHorizontal: 0,
  };

  if (loading) {
    return (
      <ScreenWrapper {...screenProps}>
        <MockupHeader title={t('checkResultTitle')} />
        <View style={styles.container}>
          <Loading />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollEnabled {...screenProps}>
      <MockupHeader title={t('checkResultTitle')} />
      <View style={styles.container}>
        <ImageFast
          source={Images.resultbanner}
          resizeMode={'contain'}
          style={styles.icon}
        />

        {totalAttempts === 0 ? (
          <View style={styles.noDataContainer}>
            <CustomText
              label={t('noTestHistory')}
              fontFamily={fonts.medium}
              fontSize={16}
              textAlign="center"
              color={colors.textPrimary}
              marginTop={20}
            />
          </View>
        ) : (
          <>
            <CustomText
              label={`${t('totalAttempts')}: ${totalAttempts}`}
              fontFamily={fonts.medium}
              fontSize={14}
              textAlign={'start'}
              color={colors.textPrimary}
              marginTop={10}
            />

            <Resultbtn
              attempts={totalAttempts}
              currentAttempt={currentAttempt}
              onAttemptChange={handleAttemptChange}
            />

            <ResultsStats currentAttemptData={currentAttemptData} />
            <QuestionsCheck currentAttemptData={currentAttemptData} />
          </>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default Result;

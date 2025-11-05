import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import MockupHeader from '../Molecules/MockupHeader';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import {COLORS} from '../../../../utils/COLORS';
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

const Result = () => {
  const {t} = useTranslation();
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
        console.log('📊 RAW API RESPONSE:', rawResponse);

        // If there is no record (total = 0 or data is empty)
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

  // Show loader while loading
  if (loading) {
    return (
      <ScreenWrapper
        statusBarColor={COLORS.btn}
        backgroundColor={COLORS.btn}
        paddingHorizontal={0}>
        <MockupHeader title={t('checkResultTitle')} />
        <View style={styles.container}>
          <Loading />
        </View>
      </ScreenWrapper>
    );
  }

  // Main return
  return (
    <ScreenWrapper
      scrollEnabled
      statusBarColor={COLORS.btn}
      backgroundColor={COLORS.btn}
      paddingHorizontal={0}>
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
              color={COLORS.black}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    padding: 20,
    marginTop: -30,
    paddingBottom: 40,
    minHeight:"100%"
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
});

export default Result;

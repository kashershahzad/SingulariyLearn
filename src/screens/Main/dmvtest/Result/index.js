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
import Loading from '../../../../components/Loading'

const Result = () => {
  const {t} = useTranslation();
  const token = useSelector(state => state.authConfig.token);
  const currentLanguage = useSelector(state => state.language.language);

  const [totalAttempts, setTotalAttempts] = useState(0);
  const [resultsData, setResultsData] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [currentAttemptData, setCurrentAttemptData] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchresult = async () => {
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
      
      const totalAttemptsCount = rawResponse.data.length;
      setTotalAttempts(totalAttemptsCount);

      rawResponse.data.forEach((item, index) => {
        const total = item?.question_data?.total;
        const correct = item?.question_data?.correct;
        const skipped = item?.question_data?.skipped;
        const percentage = item?.percentage;
        const totalDone = total - skipped;
        // const question = item.questions?.question[currentLanguage]
        // const answere = item.questions?.answere[currentLanguage]
        // const is_correct = item.questions?.is_correct
        // const is_skipped =  item.questions?.is_correct
      });
      
      setResultsData(rawResponse.data);
      
      if (totalAttemptsCount > 0) {
        setCurrentAttempt(totalAttemptsCount);
        const latestAttemptData = rawResponse.data[rawResponse.data.length - 1];
        setCurrentAttemptData(latestAttemptData);
      } else {
        setCurrentAttemptData(null);
      }
      
      setLoading(false);
    };

    fetchresult();
  }, [token, currentLanguage]);

  const handleAttemptChange = (attemptId) => {
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
  },
  icon: {
    height: 231,
    width: '100%',
    alignSelf: 'center',
  },
});

export default Result;
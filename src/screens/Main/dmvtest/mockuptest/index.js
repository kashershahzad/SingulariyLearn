import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import MockupHeader from '../Molecules/MockupHeader';
import ImageFast from '../../../../components/ImageFast';
import {Images} from '../../../../assets/images';
import {COLORS} from '../../../../utils/COLORS';
import Testfrom from './Testfrom';
import {useTranslation} from 'react-i18next';
import {ApiRequest} from '../../../../services/ApiRequest';

const Mockuptest = () => {
  const {t} = useTranslation();
  const [questiontimer, setquestiontimer] = useState(false);
  const [resettimer, setresettimer] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [error, seterror] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalQuestion, settotalQuestion] = useState('');

  useEffect(() => {
    const fetchquestion = async () => {
      try {
        const Body = {
          type: 'get_data',
          table_name: 'questions',
          is_mockup: true,
          last_id: 1,
        };

        const response = await ApiRequest(Body);
        console.log('Pratise response', response.data);
        settotalQuestion(response.data.total);

        if (response.data.data) {
          setQuestions(response.data.data);
          seterror(false);
        } else {
          seterror(true);
        }
      } catch (error) {
        console.error('API Error:', error);
        seterror(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchquestion();
  }, []);

  return (
    <ScreenWrapper
      scrollEnabled
      statusBarColor={COLORS.primaryColor4}
      paddingHorizontal={0}
      backgroundColor={'white'}>
      {error ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}>
          <Text style={{color: COLORS.red, fontSize: 16}}>
            {'Something Went wrong'}
          </Text>
        </View>
      ) : null}

      {!isLoading && !error ? (
        <MockupHeader
          setreset={setresettimer}
          resettimer={resettimer}
          timercomplete={setquestiontimer}
          mockup={true}
          timer={false}
          title={t('mockupTest')}
        />
      ) : null}

      {!error ? (
        <Testfrom
          resettimer={setresettimer}
          totalQuestions={totalQuestion}
          timercomplete={questiontimer}
          questions={questions}
          mockuptest={true}
        />
      ) : null}
    </ScreenWrapper>
  );
};

export default Mockuptest;

const styles = StyleSheet.create({});

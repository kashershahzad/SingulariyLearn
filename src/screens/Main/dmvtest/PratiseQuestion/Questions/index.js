import React, {useState, useEffect} from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import ScreenWrapper from '../../../../../components/ScreenWrapper';
import CustomText from '../../../../../components/CustomText';
import CustomButton from '../../../../../components/CustomButton';
import Header2 from '../../../DmvLicenses/Molecules/Header2';
import Loading from '../../../../../components/Loading';
import fonts from '../../../../../assets/fonts';
import {COLORS} from '../../../../../utils/COLORS';
import {ApiRequest} from '../../../../../services/ApiRequest';
import QuestionsContainer from './QuestionsContainer';
import MockupHeader from '../../Molecules/MockupHeader';

const Questions = ({navigation, route}) => {
  const {t} = useTranslation();
  const currentLanguage = useSelector(state => state.language.language);
  const {id, name, roadsign} = route.params;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [total, settotal] = useState();

  const fetchQuestions = async () => {
    try {
      const Body = {
        type: 'get_data',
        table_name: 'questions',
        is_mockup: false,
        lesson_id: id,
        limit: 50,
      };

      const response = await ApiRequest(Body);
      const apiData = response.data.data || [];
      console.log(response.data);
      const totalQuestion = response.data.total;
      settotal(totalQuestion);
      const preparedQuestions = apiData.map((question, index) => {
        const correctAnswer = question.answers.find(
          answer =>
            answer.is_correct === '1' && answer.lang === currentLanguage,
        );
        return {
          image: question.image,
          audio: question.audio,
          id: question.id.toString(),
          questionNumber: index + 1,
          question:
            JSON.parse(question.question)[currentLanguage]?.question ||
            t('questionNotAvailable'),
          answer: correctAnswer ? correctAnswer.answer : t('noCorrectAnswer'),
        };
      });

      setQuestions(preparedQuestions);
    } catch (err) {
      console.log('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleLessonPress = () => {
    navigation.navigate('LessonPage', {lesson_id: id, name});
  };

  if (loading) return <Loading />;

  const currentQuestion = questions[currentIndex];

  return (
    <ScreenWrapper
      paddingBottom={20}
      scrollEnabled
      paddingHorizontal={0}
      statusBarColor={COLORS.primaryColor4}
      backgroundColor="white"
      // headerUnScrollable={() => <MockupHeader title={name}/>}
      footerUnScrollable={() => (
        <View style={{paddingHorizontal: 20, marginTop: 20}}>
          <CustomButton
            title={t('practiceQuiz')}
            onPress={handleLessonPress}
            backgroundColor={COLORS.btn}
          />
        </View>
      )}>
      {/* <CustomText
        label={t('questionText')}
        fontFamily={fonts.medium}
        fontSize={16}
        marginTop={10}
        marginLeft={5}
      /> */}

      <MockupHeader title={name} />

      {currentQuestion && (
        <QuestionsContainer
          id={currentQuestion.id}
          questionNumber={currentQuestion.questionNumber}
          question={currentQuestion.question}
          answer={currentQuestion.answer}
          audio={currentQuestion.audio}
          image={currentQuestion.image}
          totalQuestion={total}
        />
      )}

      <View style={styles.btnContainer}>
        <View style={styles.btn}>
          <CustomButton
            width={149}
            height={52}
            fontSize={16}
            title={t('previous')}
            color={'black'}
            borderColor={'#ECEFF3'}
            borderWidth={2}
            borderRadius={25}
            onPress={handlePrevious}
            backgroundColor={'white'}
          />
          <CustomButton
            width={149}
            height={52}
            fontSize={16}
            title={t('nextButton')}
            color={'white'}
            borderColor={'#ECEFF3'}
            borderWidth={1}
            borderRadius={25}
            backgroundColor={'black'}
            onPress={handleNext}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Questions;

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    gap: 20,
  },
  paginationButton: {
    backgroundColor: COLORS.btn,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    gap: 20,
  },
  btnContainer: {
    marginTop: 'auto',
    paddingHorizontal: 20,
  },
  btn: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
});

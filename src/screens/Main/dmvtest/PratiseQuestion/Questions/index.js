import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import Loading from '../../../../../components/Loading';
import ScreenWrapper from '../../../../../components/ScreenWrapper';
import CustomText from '../../../../../components/CustomText';
import fonts from '../../../../../assets/fonts';
import {COLORS} from '../../../../../utils/COLORS';
import Header2 from '../../../DmvLicenses/Molecules/Header2';
import QuestionsContainer from './QuestionsContainer';
import {ApiRequest} from '../../../../../services/ApiRequest';
import CustomButton from '../../../../../components/CustomButton';

const Questions = ({navigation, route}) => {
  const {t} = useTranslation();
  const [loading, setLoading] = useState(true);
  const currentLanguage = useSelector(state => state.language.language);
  const [questions, setQuestions] = useState([]);
  const [error, seterror] = useState(false);
  const [totalQuestion, settotalQuestion] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const {id, name} = route.params;

  const fetchquestion = async pageNumber => {
    try {
      setLoading(true);
      const Body = {
        type: 'get_data',
        table_name: 'questions',
        is_mockup: false,
        lesson_id: id,
        last_id: pageNumber,
      };

      const response = await ApiRequest(Body);
      console.log('Practice response', response.data.data);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchquestion(currentPage);
  }, [currentPage]);

  const handleNext = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const hasNextPage = questions.length === 10;
  const hasPrevPage = currentPage > 0;

  if (loading) {
    return <Loading />;
  }
 const handleLessonPress = (id, name) => {
    navigation.navigate('LessonPage', { lesson_id: id, name });
  };
  return (
    <ScreenWrapper
      paddingBottom={20}
      scrollEnabled
      statusBarColor={COLORS.primaryColor4}
      backgroundColor="white"
      headerUnScrollable={() => <Header2 line={true} title={name} />}
      footerUnScrollable={() => (
        <View style={{paddingHorizontal:20, marginTop:20}}>
        <CustomButton
          title={'Start Pratise'}
         onPress={() => handleLessonPress(id, name)}
        />
        </View>
      )}>
      <CustomText
        label={t('Questions')}
        fontFamily={fonts.medium}
        fontSize={16}
        marginTop={10}
        marginLeft={5}
      />

      {questions.map((question, index) => {
        const correctAnswer = question.answers.find(
          answer =>
            answer.is_correct === '1' && answer.lang === currentLanguage,
        );

        const questionData = {
          id: question.id.toString(),
          questionNumber: (currentPage - 1) * 10 + index + 1,
          question:
            JSON.parse(question.question)[currentLanguage]?.question ||
            'Question not available',
          answer: correctAnswer
            ? correctAnswer.answer
            : 'No correct answer found',
        };

        return (
          <QuestionsContainer
            key={question.id}
            id={questionData.id}
            questionNumber={questionData.id}
            question={questionData.question}
            answer={questionData.answer}
          />
        );
      })}

      {/* Pagination Buttons */}
      <View style={styles.paginationContainer}>
        {hasPrevPage && (
          <TouchableOpacity
            style={styles.paginationButton}
            onPress={handleBack}>
            <CustomText
              label={t('Back')}
              fontFamily={fonts.medium}
              fontSize={14}
              color="white"
            />
          </TouchableOpacity>
        )}

        {hasNextPage && (
          <TouchableOpacity
            style={styles.paginationButton}
            onPress={handleNext}>
            <CustomText
              label={t('Next')}
              fontFamily={fonts.medium}
              fontSize={14}
              color="white"
            />
          </TouchableOpacity>
        )}
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
    backgroundColor: COLORS.primaryColor4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});

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
  const userData = useSelector(state => state.users.userData);
  const token = useSelector(state => state.authConfig.token);

  // Get mockup and roadsigns values from userData
  const mockup = userData?.purchase?.permit?.mockup;
  const roadsigns = userData?.purchase?.permit?.road_signs;

  const {id, name, roadsign, permit_id} = route.params;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [total, settotal] = useState();

  const fetchQuestions = async () => {
    try {
      const Body = {
        type: 'get_data',
        table_name: 'questions',
        lesson_id: id,
        limit: 50,
        permit_id: permit_id,
        user_id: token,
        
      };
      console.log('Request Body:', Body);

      const response = await ApiRequest(Body);
      const apiData = response.data.data || [];

      console.log('Full API Response:', response.data);
      console.log('Questions Data:', apiData);
      console.log('total questions:', total);

      const totalQuestion = response.data.total;
      settotal(totalQuestion);

      // Check if we have answers data
      if (apiData.length > 0) {
        console.log('First question data:', apiData[0]);
      }

      const preparedQuestions = apiData.map((question, index) => {
        // Parse the question text safely
        let questionText = t('questionNotAvailable');
        try {
          const parsedQuestion = JSON.parse(question.question);
          questionText =
            parsedQuestion[currentLanguage]?.question ||
            parsedQuestion.en?.question ||
            t('questionNotAvailable');
        } catch (error) {
          console.log('Error parsing question:', error);
        }

        // Check if answers exist and find correct answer
        let correctAnswerText = t('noCorrectAnswer');
        let correctAnswerImage = null; // Add this line

        // If answers array exists in the response
        if (question.answers && Array.isArray(question.answers)) {
          const correctAnswer = question.answers.find(
            answer =>
              answer.is_correct === '1' && answer.lang === currentLanguage,
          );

          correctAnswerText = correctAnswer
            ? correctAnswer.answer
            : t('noCorrectAnswer');

          // Extract the correct answer image if it exists
          if (correctAnswer && correctAnswer.image) {
            correctAnswerImage = typeof correctAnswer.image === 'string' 
              ? correctAnswer.image 
              : correctAnswer.image.url;
            console.log('🖼️ Correct answer has image:', correctAnswerImage);
          }

          // Handle image for correct answer
          if (correctAnswer) {
            if (correctAnswer.image) {
              console.log('🖼️ Correct answer has image:', {
                answerText: correctAnswer.answer,
                imageUrl:
                  typeof correctAnswer.image === 'string'
                    ? correctAnswer.image
                    : correctAnswer.image.url,
                answerId: correctAnswer.id,
              });
            } else {
              console.log('✅ Correct answer text only:', correctAnswer.answer);
            }
          }

          // Log all images from all answers
          const answersWithImages = question.answers.filter(
            answer => answer.image,
          );
          if (answersWithImages.length > 0) {
            console.log(
              '📸 Answers with images:',
              answersWithImages.map(answer => ({
                id: answer.id,
                text: answer.answer,
                image: answer.image,
                isCorrect: answer.is_correct,
              })),
            );
          }
        } else {
          console.log('No answers array found for question:', question.id);
        }

        return {
          image: question.image,
          audio: question.audio,
          video: question.video,
          id: question.id.toString(),
          questionNumber: index + 1,
          question: questionText,
          answer: correctAnswerText,
          answerImage: correctAnswerImage, // Add this line
          rawData: question,
        };
      });

      console.log('Prepared Questions:', preparedQuestions);

      setQuestions(preparedQuestions);
    } catch (err) {
      console.log('API Error:', err);
      console.log('Error details:', err.response?.data || err.message);
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

  const handleDone = () => {
    navigation.goBack();
    // Or navigate to a results screen:
    // navigation.navigate('Results', { lessonId: id });
  };

  const handleLessonPress = () => {
    navigation.navigate('LessonPage', {lesson_id: id, name});
  };

  if (loading) return <Loading />;

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const shouldShowPracticeQuiz = total > 1;

  return (
    <ScreenWrapper
      paddingBottom={20}
      scrollEnabled
      paddingHorizontal={0}
      statusBarColor={COLORS.primaryColor4}
      backgroundColor="white"
      // headerUnScrollable={() => <MockupHeader title={name}/>}
      footerUnScrollable={() =>
        shouldShowPracticeQuiz && (
          <View style={{paddingHorizontal: 20, marginTop: 20}}>
            <CustomButton
              title={t('practiceQuiz')}
              onPress={handleLessonPress}
              backgroundColor={COLORS.btn}
            />
          </View>
        )
      }>
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
          answerImage={currentQuestion.answerImage} // Pass the answer image
          audio={currentQuestion.audio}
          image={currentQuestion.image}
          totalQuestion={total}
          video={currentQuestion.video}
        />
      )}

      {shouldShowPracticeQuiz && (
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
            {isLastQuestion ? (
              <CustomButton
                width={149}
                height={52}
                fontSize={16}
                title={t('nextButton')}
                color={'white'}
                borderColor={'#ECEFF3'}
                borderWidth={1}
                borderRadius={25}
                backgroundColor={COLORS.success}
                onPress={handleDone}
              />
            ) : (
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
            )}
          </View>
        </View>
      )}
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
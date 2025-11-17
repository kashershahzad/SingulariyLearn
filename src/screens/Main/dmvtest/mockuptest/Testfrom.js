import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomText from '../../../../components/CustomText';
import fonts from '../../../../assets/fonts';
import {COLORS} from '../../../../utils/COLORS';
import ImageFast from '../../../../components/ImageFast';
import {Images} from '../../../../assets/images';
import CustomButton from '../../../../components/CustomButton';
import {useNavigation} from '@react-navigation/native';
import {ApiRequest} from '../../../../services/ApiRequest';
import {useSelector} from 'react-redux';
import Video from 'react-native-video';
import {useTranslation} from 'react-i18next';

const Testfrom = ({
  timercomplete,
  resettimer,
  mockup = false,
  roadsign = false,
  mockuptest = false,
  totalQuestions,
  lesson_id,
  lesson = true,
  questions: initialQuestions,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitloading, setsubmitloading] = useState(false);
  const [allAnswers, setAllAnswers] = useState([]);
  const navigation = useNavigation();
  const token = useSelector(state => state.authConfig.token);
  const currentLanguage = useSelector(state => state.language.language);
  const [score, setScore] = useState(0);
  const [questionStartTimes, setQuestionStartTimes] = useState({});
  const [totalTime, setTotalTime] = useState(0);
  const [averageTime, setAverageTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLessonMode, setIsLessonMode] = useState(false);
  const {t} = useTranslation();

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  // Function to get complete image URL
  const getCompleteImageUrl = (imagePath) => {
    if (!imagePath || imagePath.trim() === '') return null;
    
    // If imagePath is already a full URL, return it as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If imagePath is just a filename, concatenate with base URL
    const baseUrl = 'https://7tracking.com/dmvpermit/images/';
    
    // Remove leading slash if present
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    
    return baseUrl + cleanPath;
  };

  useEffect(() => {
    setIsLessonMode(lesson_id && lesson);
    if (initialQuestions && initialQuestions.length > 0) {
      parseQuestions(initialQuestions);
      setIsLoading(false);
    }
  }, [initialQuestions]);

  useEffect(() => {
    if (currentQuestionIndex > 0 && totalTime > 0) {
      setAverageTime(totalTime / (currentQuestionIndex + 1));
    }
  }, [totalTime, currentQuestionIndex]);

  const parseQuestions = questionsArray => {
    const parsed = questionsArray.map(q => {
      let questionData;
      try {
        questionData = JSON.parse(q.question);
      } catch (error) {
        questionData = {en: {question: q.question}, ur: {question: q.question}};
      }

      const questionText =
        questionData[currentLanguage]?.question || 'Question not available';

      const languageAnswers =
        q.answers && Array.isArray(q.answers)
          ? q.answers.filter(answer => answer.lang === currentLanguage)
          : [];

      const fallbackAnswers =
        languageAnswers.length > 0
          ? languageAnswers
          : q.answers && Array.isArray(q.answers)
          ? q.answers.filter(answer => answer.lang === 'en')
          : [];

      // Create options with both text and complete image URL
      const options = fallbackAnswers.map(answer => ({
        answer: answer.answer,
        image: getCompleteImageUrl(answer.image),
        correct: parseInt(answer.is_correct),
      }));

      // Check if any option has a valid image
      const hasOptionImages = options.some(option => 
        option.image && 
        option.image.trim() !== '' && 
        option.image !== 'https://7tracking.com/dmvpermit/images/' &&
        !option.image.includes('/images/""')
      );

      const correctIndex = options.findIndex(option => option.correct === 1);

      return {
        ...q,
        question: questionText,
        options: options,
        hasOptionImages: hasOptionImages, // Flag to indicate if options have images
        correctAnswerIndex: correctIndex !== -1 ? correctIndex : 0,
      };
    });

    setParsedQuestions(parsed);
    setIsLoading(false);

    // Initialize timing for first question
    if (parsed.length > 0) {
      setQuestionStartTimes({0: Date.now()});
    }
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < parsedQuestions.length - 1) {
      const endTime = Date.now();
      const startTime = questionStartTimes[currentQuestionIndex] || endTime;
      const timeTaken = (endTime - startTime) / 1000;

      setTotalTime(prevTotal => prevTotal + timeTaken);

      setQuestionStartTimes(prev => ({
        ...prev,
        [currentQuestionIndex + 1]: Date.now(),
      }));

      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setShowFeedback(false);
      setIsTransitioning(false);
      setSelectedOption(null);
      resettimer && resettimer(true);
    } else {
      // Last question - submit all answers
      const endTime = Date.now();
      const startTime = questionStartTimes[currentQuestionIndex] || endTime;
      const timeTaken = (endTime - startTime) / 1000;
      setTotalTime(prevTotal => prevTotal + timeTaken);

      setShowFeedback(false);
      setIsTransitioning(false);
      setSelectedOption(null);
      submitAllAnswers();
    }
  };

  const handleSkip = () => {
    const endTime = Date.now();
    const startTime = questionStartTimes[currentQuestionIndex] || endTime;
    const timeTaken = (endTime - startTime) / 1000;
    setTotalTime(prevTotal => prevTotal + timeTaken);

    const currentQuestion = parsedQuestions[currentQuestionIndex];
    const alreadySaved = allAnswers.some(
      ans => ans.question_id === currentQuestion.id,
    );

    if (!alreadySaved) {
      saveCurrentAnswer(null);
    }

    if (currentQuestionIndex < parsedQuestions.length - 1) {
      setQuestionStartTimes(prev => ({
        ...prev,
        [currentQuestionIndex + 1]: Date.now(),
      }));

      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowFeedback(false);
      setSelectedOption(null);
      resettimer && resettimer(true);
    } else {
      // Last question - submit
      setShowFeedback(false);
      setSelectedOption(null);
      submitAllAnswers();
    }
  };

  const handleOptionSelect = index => {
    if (!isTransitioning && !showFeedback) {
      setSelectedOption(index);

      const currentQuestion = parsedQuestions[currentQuestionIndex];
      const alreadySaved = allAnswers.some(
        ans => ans.question_id === currentQuestion.id,
      );

      if (!alreadySaved) {
        saveCurrentAnswer(index);
      }

      if (!mockuptest) {
        setShowFeedback(true);
      }
    }
  };

  const saveCurrentAnswer = answerIndex => {
    const currentQuestion = parsedQuestions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswerIndex;
    const wasSkipped = answerIndex === null;

    const selectedAnswerText =
      answerIndex !== null
        ? currentQuestion.options[answerIndex]?.answer
        : null;

    const answerData = {
      question_id: currentQuestion.id,
      selected_option: answerIndex,
      selected_answer_text: selectedAnswerText,
      is_correct: isCorrect,
      skiped: wasSkipped ? 1 : 0,
      timestamp: Date.now(),
      is_mockup: mockuptest,
      is_lesson: isLessonMode,
      question_text: currentQuestion.question,
      options: currentQuestion.options.map(opt => opt.answer),
    };

    setAllAnswers(prev => {
      const filtered = prev.filter(
        ans => ans.question_id !== currentQuestion.id,
      );
      return [...filtered, answerData];
    });

    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }
  };

  const getOptionStyle = index => {
    const isSelected = selectedOption === index;
    const isCorrect =
      index === parsedQuestions[currentQuestionIndex]?.correctAnswerIndex;

    if (showFeedback && !mockuptest) {
      if (isSelected) {
        return isCorrect ? styles.correctOption : styles.incorrectOption;
      }
      if (isCorrect) {
        return styles.correctOption;
      }
    }

    return isSelected ? styles.selectedOption : null;
  };

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      moveToNextQuestion();
    }, 100);
  };

  const submitAllAnswers = async () => {
    try {
      setsubmitloading(true);

      const finalAverageTime = totalTime / (allAnswers.length || 1);

      console.log('Submitting answers:', {
        score,
        totalQuestions: allAnswers.length,
        averageTime: finalAverageTime,
        answersCount: allAnswers.length,
        isMockup: mockuptest,
      });

      const Body = {
        type: 'add_data',
        user_id: token,
        table_name: 'user_questionnaire',
        questions: JSON.stringify(allAnswers),
        score: score,
        average_time: finalAverageTime,
        is_mockup: mockup,
        is_roadsign: roadsign,
        lesson_id: isLessonMode ? lesson_id : null,
      };

      console.log('Submitting to API:', Body);
      const response = await ApiRequest(Body);

      navigation.replace('Congratulations', {
        score: score,
        totalQuestions: allAnswers.length,
        averageTime: finalAverageTime,
        isMockup: false,
        isLesson: isLessonMode,
      });
    } catch (error) {
      console.error('Error submitting answers:', error);
      Alert.alert('Error', 'Failed to submit answers. Please try again.');
    } finally {
      setsubmitloading(false);
    }
  };

  const handleNextOrSubmit = async () => {
    const isLastQuestion = currentQuestionIndex === parsedQuestions.length - 1;

    if (isLastQuestion) {
      submitAllAnswers();
    } else {
      handleNext();
    }
  };

  const getImageUrl = question => {
    if (
      question.image &&
      question.image !== '' &&
      question.image !== 'https://7tracking.com/dmvpermit/images/' &&
      !question.image.includes('/images/""')
    ) {
      // Use the helper function to get complete URL for question image too
      return {uri: getCompleteImageUrl(question.image)};
    }
    return null;
  };

  const getVideoUrl = question => {
    if (
      question.video &&
      question.video !== '' &&
      question.video !== 'https://7tracking.com/dmvpermit/images/' &&
      !question.video.includes('/images/""')
    ) {
      return {uri: question.video};
    }
    return null;
  };

  const getAudioUrl = question => {
    try {
      const audioData = JSON.parse(question.audio);
      return audioData[currentLanguage];
    } catch (error) {
      return null;
    }
  };

  const renderMedia = question => {
    const imageUrl = getImageUrl(question);
    const videoUrl = getVideoUrl(question);

    if (videoUrl) {
      return (
        <Video
          source={videoUrl}
          style={styles.video}
          resizeMode="contain"
          paused={false}
          repeat
          muted={false}
          controls={true}
        />
      );
    }
    if (imageUrl) {
      return (
        <ImageFast
          source={imageUrl}
          resizeMode={'contain'}
          style={styles.icon}
        />
      );
    }
    return (
      <View
        style={{
          height: 200,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={{color: 'gray'}}>{t('noMedia')}</Text>
      </View>
    );
  };

  if (isLoading || parsedQuestions.length === 0) {
    return (
      <View style={[styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primaryColor4} />
        <CustomText
          label={'Loading questions...'}
          fontFamily={fonts.regular}
          marginTop={10}
          fontSize={14}
        />
      </View>
    );
  }

  if (submitloading) {
    return (
      <View style={[styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primaryColor4} />
        <CustomText
          label={'Submitting answers...'}
          fontFamily={fonts.regular}
          marginTop={10}
          fontSize={14}
        />
      </View>
    );
  }

  const currentQuestionNumber = currentQuestionIndex + 1;
  const progressWidth = `${
    (currentQuestionNumber / parsedQuestions.length) * 100
  }%`;
  const currentQuestion = parsedQuestions[currentQuestionIndex];
  const shouldShowFeedback = showFeedback && !mockuptest;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <CustomText
            label={
              t('question') +
              ` ${currentQuestionNumber}/${parsedQuestions.length}`
            }
            fontFamily={fonts.jakartaBold}
            fontSize={16}
            color={'#4F4F4F'}
          />
          <Video
            source={{uri: getAudioUrl(currentQuestion)}}
            paused={!isPlaying}
            audioOnly={true}
            style={styles.audioElement}
          />
          <ImageFast
            source={Images.audiobtn}
            onPress={togglePlayback}
            resizeMode={'contain'}
            style={styles.audio}
          />
        </View>

        <View style={styles.lineBackground}>
          <View style={[styles.lineProgress, {width: progressWidth}]}></View>
        </View>

        <View style={{minHeight: 80}}>
          <CustomText
            label={currentQuestion.question}
            fontFamily={fonts.regular}
            marginTop={10}
            fontSize={16}
          />
        </View>

        {renderMedia(currentQuestion)}

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            // Check if this option has a valid image
            const hasImage = option.image && 
                            option.image.trim() !== '' && 
                            option.image !== 'https://7tracking.com/dmvpermit/images/' &&
                            !option.image.includes('/images/""');

            if (hasImage) {
              // Image options - 48% width (2 per row) ALWAYS
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.imageOption, // This has 48% width
                    getOptionStyle(index)
                  ]}
                  onPress={() => handleOptionSelect(index)}
                  disabled={(showFeedback && !mockuptest) || isTransitioning}>
                  
                  <ImageFast
                    source={{uri: option.image}}
                    resizeMode={'contain'}
                    style={styles.optionImage}
                  />
                  
                  <CustomText
                    textAlign={'center'}
                    label={option.answer}
                    fontFamily={fonts.regular}
                    fontSize={12}
                    color={'#707070'}
                    marginTop={5}
                    numberOfLines={2}
                  />
                </TouchableOpacity>
              );
            } else {
              // Text-only options - 100% width (1 per row) ALWAYS
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.textOption, // This has 100% width
                    getOptionStyle(index)
                  ]}
                  onPress={() => handleOptionSelect(index)}
                  disabled={(showFeedback && !mockuptest) || isTransitioning}>
                  <CustomText
                    textAlign={'center'}
                    label={option.answer}
                    fontFamily={fonts.regular}
                    fontSize={14}
                    color={'#707070'}
                  />
                </TouchableOpacity>
              );
            }
          })}
        </View>
      </ScrollView>

      <View style={styles.btnContainer}>
        <View style={styles.btn}>
          {!shouldShowFeedback ? (
            <>
              <CustomButton
                width={149}
                height={52}
                fontSize={16}
                title={t('skip')}
                color={'black'}
                borderColor={'#ECEFF3'}
                borderWidth={2}
                borderRadius={25}
                onPress={handleSkip}
                disabled={isTransitioning}
                backgroundColor={'white'}
              />
              <CustomButton
                disabled={selectedOption === null || isTransitioning}
                width={149}
                height={52}
                fontSize={16}
                title={t('nextButton')}
                color={'white'}
                borderColor={'#ECEFF3'}
                borderWidth={1}
                borderRadius={25}
                backgroundColor={
                  selectedOption === null || isTransitioning
                    ? '#C0C0C0'
                    : 'black'
                }
                onPress={handleNextOrSubmit}
              />
            </>
          ) : (
            <>
              <CustomButton
                width={149}
                height={52}
                fontSize={16}
                title={t('skip')}
                color={'black'}
                borderColor={'#ECEFF3'}
                borderWidth={2}
                borderRadius={25}
                backgroundColor={'white'}
                onPress={handleSkip}
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
                backgroundColor={COLORS.btn}
                onPress={handleNextOrSubmit}
              />
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default Testfrom;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    padding: 20,
    marginTop: -30,
    paddingBottom: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginTop: 200,
  },
  lineBackground: {
    height: 4,
    borderRadius: 10,
    backgroundColor: '#b9bad3ff',
    marginTop: 10,
  },
  lineProgress: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: COLORS.btn,
  },
  icon: {
    height: 202,
    width: '100%',
    alignSelf: 'center',
    marginBottom: 5,
  },
  video: {
    height: 200,
    width: '100%',
    borderRadius: 10,
    marginVertical: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  textOption: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#ECEFF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 5,
    paddingVertical: 15,
    borderRadius: 8,
    minHeight: 100,
    width: '100%', // 100% width for text-only options (1 per row)
  },
  imageOption: {
    width: '48%', // 48% width for image options (2 per row)
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#ECEFF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 120,
  },
  optionImage: {
    height: 80,
    width: '100%',
    borderRadius: 8,
  },
  optionImagePlaceholder: {
    height: 80,
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 12,
  },
  selectedOption: {
    borderColor: COLORS.btn,
    borderWidth: 2,
    backgroundColor: '#EFEFEF',
  },
  correctOption: {
    borderColor: 'green',
    borderWidth: 2,
  },
  incorrectOption: {
    borderColor: 'red',
    borderWidth: 2,
  },
  btnContainer: {
    marginTop: 'auto',
    marginBottom: 30,
  },
  btn: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  audio: {
    height: 23,
    width: 23,
  },
  audioElement: {
    width: 0,
    height: 0,
  },
});
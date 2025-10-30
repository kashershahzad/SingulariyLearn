import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import CustomText from '../../../../components/CustomText';
import fonts from '../../../../assets/fonts';
import { COLORS } from '../../../../utils/COLORS';
import ImageFast from '../../../../components/ImageFast';
import { Images } from '../../../../assets/images';
import CustomButton from '../../../../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { ApiRequest } from '../../../../services/ApiRequest';
import { useSelector } from 'react-redux';
import Video from 'react-native-video';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const Testfrom = ({ 
    timercomplete, 
    resettimer, 
    mockup=false,
    roadsign=false,
    mockuptest,
    totalQuestions, 
    lesson_id, 
    lesson = true,
    questions: initialQuestions 
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
    const [currentPageIndex, setCurrentPageIndex] = useState(1);
    const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLessonMode, setIsLessonMode] = useState(false);
    const [totalQuestionsCount, setTotalQuestionsCount] = useState(totalQuestions || 0);
    const {t} = useTranslation()

    const STORAGE_KEYS = mockuptest ? {
        ALL_ANSWERS: 'mockup_all_answers',
        CURRENT_PROGRESS: 'mockup_current_progress',
        SCORE: 'mockup_score',
        TOTAL_TIME: 'mockup_total_time',
        CURRENT_PAGE: 'mockup_current_page',
        TOTAL_ANSWERED: 'mockup_total_answered',
        MOCKUP_RESULTS: 'mockup_final_results'
    } : {
        ALL_ANSWERS: 'test_all_answers',
        CURRENT_PROGRESS: 'test_current_progress',
        SCORE: 'test_score',
        TOTAL_TIME: 'test_total_time',
        CURRENT_PAGE: 'test_current_page',
        TOTAL_ANSWERED: 'test_total_answered'
    };

    const togglePlayback = () => {
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        setIsLessonMode(lesson_id && lesson);
        if (initialQuestions && initialQuestions.length > 0) {
            parseQuestions(initialQuestions);
            setTotalQuestionsCount(totalQuestions || initialQuestions.length);
            setIsLoading(false);
        } else {
            loadSavedProgress();
        }
    }, [initialQuestions]);

    useEffect(() => {
        if (allAnswers.length > 0 || currentPageIndex > 1) {
            saveProgressToStorage();
        }
    }, [allAnswers, currentPageIndex, currentQuestionIndex, score, totalTime, totalQuestionsAnswered]);

    const loadSavedProgress = async () => {
        try {
            setIsLoading(true);
            
            const [
                savedAnswers,
                savedProgress,
                savedScore,
                savedTotalTime,
                savedCurrentPage,
                savedTotalAnswered
            ] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.ALL_ANSWERS),
                AsyncStorage.getItem(STORAGE_KEYS.CURRENT_PROGRESS),
                AsyncStorage.getItem(STORAGE_KEYS.SCORE),
                AsyncStorage.getItem(STORAGE_KEYS.TOTAL_TIME),
                AsyncStorage.getItem(STORAGE_KEYS.CURRENT_PAGE),
                AsyncStorage.getItem(STORAGE_KEYS.TOTAL_ANSWERED)
            ]);

            if (savedAnswers && savedProgress) {
                const answers = JSON.parse(savedAnswers);
                const progress = JSON.parse(savedProgress);
                
                setAllAnswers(answers);
                setScore(savedScore ? parseInt(savedScore) : 0);
                setTotalTime(savedTotalTime ? parseFloat(savedTotalTime) : 0);
                setCurrentPageIndex(savedCurrentPage ? parseInt(savedCurrentPage) : 1);
                setTotalQuestionsAnswered(savedTotalAnswered ? parseInt(savedTotalAnswered) : 0);

                console.log('🔄 LOADED SAVED ANSWERS:', answers.length);
                await loadQuestions(savedCurrentPage ? parseInt(savedCurrentPage) : 1, progress.currentQuestionIndex || 0);
            } else {
                await loadQuestions(1);
            }
        } catch (error) {
            console.error("Error loading saved progress:", error);
            await loadQuestions(1);
        }
    };

    const saveProgressToStorage = async () => {
        try {
            const progressData = {
                currentQuestionIndex,
                currentPageIndex,
                timestamp: Date.now(),
                date: new Date().toISOString(),
                isMockup: mockuptest,
                isLessonMode: isLessonMode
            };

            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEYS.ALL_ANSWERS, JSON.stringify(allAnswers)),
                AsyncStorage.setItem(STORAGE_KEYS.CURRENT_PROGRESS, JSON.stringify(progressData)),
                AsyncStorage.setItem(STORAGE_KEYS.SCORE, score.toString()),
                AsyncStorage.setItem(STORAGE_KEYS.TOTAL_TIME, totalTime.toString()),
                AsyncStorage.setItem(STORAGE_KEYS.CURRENT_PAGE, currentPageIndex.toString()),
                AsyncStorage.setItem(STORAGE_KEYS.TOTAL_ANSWERED, totalQuestionsAnswered.toString())
            ]);

            console.log('💾 SAVED ANSWERS TO STORAGE:', allAnswers.length);
        } catch (error) {
            console.error("Error saving progress:", error);
        }
    };

    const clearSavedProgress = async () => {
        try {
            await Promise.all([
                AsyncStorage.removeItem(STORAGE_KEYS.ALL_ANSWERS),
                AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_PROGRESS),
                AsyncStorage.removeItem(STORAGE_KEYS.SCORE),
                AsyncStorage.removeItem(STORAGE_KEYS.TOTAL_TIME),
                AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_PAGE),
                AsyncStorage.removeItem(STORAGE_KEYS.TOTAL_ANSWERED)
            ]);
        } catch (error) {
            console.error("Error clearing progress:", error);
        }
    };

    const loadQuestions = async (pageIndex, savedQuestionIndex = 0) => {
        try {
            setIsLoading(true);
            
            // CRITICAL: Load current answers from storage before loading new page
            const currentSavedAnswers = await AsyncStorage.getItem(STORAGE_KEYS.ALL_ANSWERS);
            if (currentSavedAnswers) {
                const parsedAnswers = JSON.parse(currentSavedAnswers);
                setAllAnswers(parsedAnswers);
                console.log('📥 LOADED CURRENT ANSWERS BEFORE PAGE LOAD:', parsedAnswers.length);
            }

            const Body = {
                type: "get_data",
                table_name: "questions",
                is_mockup: mockuptest,
                page: pageIndex,
            };

            if (lesson_id && lesson) {
                Body.lesson_id = lesson_id;
            }

            console.log('📥 LOADING PAGE:', pageIndex);
            const response = await ApiRequest(Body);
            
            if (response.data && response.data.data && response.data.data.length > 0) {
                const newQuestions = response.data.data;
                parseQuestions(newQuestions);
                setCurrentPageIndex(pageIndex);
                setCurrentQuestionIndex(savedQuestionIndex);
                setSelectedOption(null);
                setShowFeedback(false);
                setQuestionStartTimes({ [savedQuestionIndex]: Date.now() });
                resettimer(true);
                
                if (response.data.total) {
                    setTotalQuestionsCount(response.data.total);
                }
                
                console.log(`✅ LOADED PAGE ${pageIndex}: ${newQuestions.length} questions | TOTAL ANSWERS: ${allAnswers.length}`);
            } else {
                if (allAnswers.length > 0) {
                    console.log('🚀 NO MORE QUESTIONS - SUBMITTING ALL:', allAnswers.length);
                    await submitAllAnswers();
                } else {
                    Alert.alert('No Questions', 'No questions found.');
                    setIsLoading(false);
                }
            }
        } catch (error) {
            console.error("Error loading questions:", error);
            if (allAnswers.length > 0) {
                console.log('🚀 ERROR BUT SUBMITTING:', allAnswers.length);
                await submitAllAnswers();
            } else {
                Alert.alert('Error', 'Failed to load questions. Please try again.');
                setIsLoading(false);
            }
        }
    };

    const parseQuestions = (questionsArray) => {
        const parsed = questionsArray.map(q => {
            let questionData;
            try {
                questionData = JSON.parse(q.question);
            } catch (error) {
                questionData = { en: { question: q.question }, ur: { question: q.question } };
            }

            const questionText = questionData[currentLanguage]?.question || 'Question not available';

            const languageAnswers = q.answers.filter(answer => answer.lang === currentLanguage);

            const fallbackAnswers = languageAnswers.length > 0
                ? languageAnswers
                : q.answers.filter(answer => answer.lang === 'en');

            const options = fallbackAnswers.map(answer => ({
                answer: answer.answer,
                correct: parseInt(answer.is_correct)
            }));

            const correctIndex = options.findIndex(option => option.correct === 1);

            return {
                ...q,
                question: questionText,
                options: options,
                correctAnswerIndex: correctIndex !== -1 ? correctIndex : 0
            };
        });

        setParsedQuestions(parsed);
        setIsLoading(false);
    };

    useEffect(() => {
        if (currentQuestionIndex > 0 && totalTime > 0) {
            setAverageTime(totalTime / (totalQuestionsAnswered + currentQuestionIndex));
        }
    }, [totalTime, currentQuestionIndex, totalQuestionsAnswered]);

    const moveToNextQuestion = () => {
        if (currentQuestionIndex < parsedQuestions.length - 1) {
            const endTime = Date.now();
            const startTime = questionStartTimes[currentQuestionIndex] || endTime;
            const timeTaken = (endTime - startTime) / 1000;

            setTotalTime(prevTotal => prevTotal + timeTaken);

            setQuestionStartTimes(prev => ({
                ...prev,
                [currentQuestionIndex + 1]: Date.now()
            }));

            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);
            setShowFeedback(false);
            setIsTransitioning(false);
            setSelectedOption(null);
            resettimer(true);
        } else {
            const endTime = Date.now();
            const startTime = questionStartTimes[currentQuestionIndex] || endTime;
            const timeTaken = (endTime - startTime) / 1000;
            setTotalTime(prevTotal => prevTotal + timeTaken);
            
            const totalAnsweredSoFar = totalQuestionsAnswered + parsedQuestions.length;
            const hasMoreQuestions = totalAnsweredSoFar < totalQuestionsCount;
            
            console.log(`📄 PAGE ${currentPageIndex} COMPLETE | ANSWERS: ${allAnswers.length} | TOTAL: ${totalQuestionsCount}`);
            
            if (hasMoreQuestions) {
                setTotalQuestionsAnswered(totalAnsweredSoFar);
                setShowFeedback(false);
                setIsTransitioning(false);
                setSelectedOption(null);
                loadQuestions(currentPageIndex + 1, 0);
            } else {
                setTotalQuestionsAnswered(totalAnsweredSoFar);
                setShowFeedback(false);
                setIsTransitioning(false);
                setSelectedOption(null);
                console.log('🎯 FINAL SUBMISSION TRIGGERED - ANSWERS:', allAnswers.length);
                submitAllAnswers();
            }
        }
    };

    const handleSkip = () => {
        const endTime = Date.now();
        const startTime = questionStartTimes[currentQuestionIndex] || endTime;
        const timeTaken = (endTime - startTime) / 1000;
        setTotalTime(prevTotal => prevTotal + timeTaken);

        const currentQuestion = parsedQuestions[currentQuestionIndex];
        const alreadySaved = allAnswers.some(ans => ans.question_id === currentQuestion.id);
        
        if (!alreadySaved) {
            saveCurrentAnswer(null);
        }

        if (currentQuestionIndex < parsedQuestions.length - 1) {
            setQuestionStartTimes(prev => ({
                ...prev,
                [currentQuestionIndex + 1]: Date.now()
            }));

            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setShowFeedback(false);
            setSelectedOption(null);
            resettimer(true);
        } else {
            const totalAnsweredSoFar = totalQuestionsAnswered + parsedQuestions.length;
            const hasMoreQuestions = totalAnsweredSoFar < totalQuestionsCount;
            
            if (hasMoreQuestions) {
                setTotalQuestionsAnswered(totalAnsweredSoFar);
                setShowFeedback(false);
                setSelectedOption(null);
                loadQuestions(currentPageIndex + 1, 0);
            } else {
                setTotalQuestionsAnswered(totalAnsweredSoFar);
                setShowFeedback(false);
                setSelectedOption(null);
                console.log('🎯 FINAL SUBMISSION AFTER SKIP - ANSWERS:', allAnswers.length);
                submitAllAnswers();
            }
        }
    };

    const handleOptionSelect = (index) => {
        if (!isTransitioning && !showFeedback) {
            setSelectedOption(index);
            
            const currentQuestion = parsedQuestions[currentQuestionIndex];
            const alreadySaved = allAnswers.some(ans => ans.question_id === currentQuestion.id);
            
            if (!alreadySaved) {
                saveCurrentAnswer(index);
            }

            if (!mockuptest) {
                setShowFeedback(true);
            }
        }
    };

    const saveCurrentAnswer = (answerIndex) => {
        const currentQuestion = parsedQuestions[currentQuestionIndex];
        const isCorrect = answerIndex === currentQuestion.correctAnswerIndex;
        const wasSkipped = answerIndex === null;
        
        const selectedAnswerText = answerIndex !== null 
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
            options: currentQuestion.options.map(opt => opt.answer)
        };

        setAllAnswers(prev => {
            const filtered = prev.filter(ans => ans.question_id !== currentQuestion.id);
            const newAnswers = [...filtered, answerData];
            console.log(`💾 SAVED ANSWER | TOTAL: ${newAnswers.length} | QID: ${currentQuestion.id}`);
            
            // CRITICAL: Immediately save to AsyncStorage
            AsyncStorage.setItem(STORAGE_KEYS.ALL_ANSWERS, JSON.stringify(newAnswers));
            
            return newAnswers;
        });
        
        if (isCorrect) {
            setScore(prevScore => prevScore + 1);
        }
    };

    const getOptionStyle = (index) => {
        const isSelected = selectedOption === index;
        const isCorrect = index === parsedQuestions[currentQuestionIndex]?.correctAnswerIndex;

        if (showFeedback && !mockuptest) {
            if (isSelected) {
                return isCorrect ? styles.correctOption : styles.incorrectOption;
            }
            if (isCorrect) {
                return styles.correctOption;
            }
        }
        
        return isSelected ? styles.selectedOption : styles.option;
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

            // CRITICAL: Force load ALL answers from AsyncStorage one more time before submission
            const finalAnswers = await AsyncStorage.getItem(STORAGE_KEYS.ALL_ANSWERS);
            const allAnswersToSubmit = finalAnswers ? JSON.parse(finalAnswers) : allAnswers;

            console.log('🚀🚀🚀 FINAL SUBMISSION 🚀🚀🚀');
            console.log('TOTAL ANSWERS TO SUBMIT:', allAnswersToSubmit.length);
            console.log('SCORE:', score);
            console.log('TOTAL QUESTIONS COUNT:', totalQuestionsCount);
            
            // Log all answers for verification
            allAnswersToSubmit.forEach((answer, index) => {
                console.log(`Answer ${index + 1}: QID ${answer.question_id} - ${answer.skipped ? 'SKIPPED' : 'ANSWERED'}`);
            });

            if (mockuptest) {
                const mockupResults = {
                    score: score,
                    totalQuestions: allAnswersToSubmit.length,
                    averageTime: finalAverageTime,
                    answers: allAnswersToSubmit,
                    timestamp: Date.now(),
                    date: new Date().toISOString()
                };

                await AsyncStorage.setItem(STORAGE_KEYS.MOCKUP_RESULTS, JSON.stringify(mockupResults));

                navigation.replace('MockupResults', {
                    score: score,
                    totalQuestions: allAnswersToSubmit.length,
                    averageTime: finalAverageTime,
                    answers: allAnswersToSubmit,
                    isMockup: true
                });
            } else {
                const Body = {
                    type: "add_data",
                    user_id: token,
                    table_name: 'user_questionnaire',
                    questions: JSON.stringify(allAnswersToSubmit),
                    score: score,
                    average_time: finalAverageTime,
                    is_mockup: mockup,
                    is_roadsign: roadsign,
                    lesson_id: isLessonMode ? lesson_id : null
                };

                console.log('📤 SUBMITTING BODY WITH ANSWERS:', allAnswersToSubmit.length);
                console.log('Body.questions length:', Body.questions.length);

                const response = await ApiRequest(Body);

                await clearSavedProgress();

                navigation.replace('Congratulations', {
                    score: score,
                    totalQuestions: allAnswersToSubmit.length,
                    averageTime: finalAverageTime,
                    isMockup: false,
                    isLesson: isLessonMode
                });
            }

            await clearSavedProgress();

        } catch (error) {
            console.error("Error submitting answers:", error);
            Alert.alert('Error', 'Failed to submit answers. Please try again.');
        } finally {
            setsubmitloading(false);
        }
    };

    const saveQuestionHistory = async () => {
        try {
            const currentQuestion = parsedQuestions[currentQuestionIndex];
            const currentAnswer = allAnswers.find(ans => ans.question_id === currentQuestion.id);
            
            const Body = {
                type: "add_data",
                table_name: "user_history",
                user_id: token,
                question_id: currentQuestion.id,
                lesson_id: lesson_id || null,
                answere: currentAnswer?.selected_option !== null && currentAnswer?.selected_option !== undefined 
                    ? currentQuestion.options[currentAnswer.selected_option]?.answer || "" 
                    : "",
                is_correct: currentAnswer?.is_correct ? 1 : 0
            };
            
            await ApiRequest(Body);
            
        } catch (error) {
            console.error("Error saving question history:", error);
        }
    };

    const handleNextOrSubmit = async () => {
        await saveQuestionHistory();
        
        const totalAnsweredSoFar = totalQuestionsAnswered + currentQuestionIndex + 1;
        const isLastQuestionOverall = totalAnsweredSoFar >= totalQuestionsCount;
        
        console.log(`➡️ NEXT | Answers: ${allAnswers.length} | Total: ${totalQuestionsCount}`);
        
        if (isLastQuestionOverall) {
            console.log('🎯 LAST QUESTION - SUBMITTING ALL');
            submitAllAnswers();
        } else if (currentQuestionIndex === parsedQuestions.length - 1) {
            moveToNextQuestion();
        } else {
            handleNext();
        }
    };

    const getImageUrl = (question) => {
        if (question.image && 
            question.image !== "" &&
            question.image !== 'https://7tracking.com/dmvpermit/images/' &&
            !question.image.includes('/images/""')) {
          return { uri: question.image };
        }
        return null;
    };

    const getAudioUrl = (question) => {
        try {
            const audioData = JSON.parse(question.audio);
            return audioData[currentLanguage];
        } catch (error) {
            return null;
        }
    };

    if (isLoading || parsedQuestions.length === 0 || submitloading) {
        return (
            <View style={[styles.centerContent]}>
                <ActivityIndicator size="large" color={COLORS.primaryColor4} />
                <CustomText
                    label={submitloading ? "Submitting answers..." : "Loading questions..."}
                    fontFamily={fonts.regular}
                    marginTop={10}
                    fontSize={14}
                />
            </View>
        );
    }

    const currentQuestionNumber = totalQuestionsAnswered + currentQuestionIndex + 1;
    const progressWidth = `${((currentQuestionNumber) / totalQuestionsCount) * 100}%`;
    const currentQuestion = parsedQuestions[currentQuestionIndex];
    const shouldShowFeedback = showFeedback && !mockuptest;

    return (
        <View style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <CustomText
                        label={t('question') + `${currentQuestionNumber}/${totalQuestionsCount}`}
                        fontFamily={fonts.jakartaBold}
                        fontSize={16}
                        color={'#4F4F4F'}
                    />
                    <Video
                        source={{ uri: getAudioUrl(currentQuestion) }}
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
                    <View style={[styles.lineProgress, { width: progressWidth }]}></View>
                </View>

                <View style={{ minHeight: 80 }}>
                    <CustomText
                        label={currentQuestion.question}
                        fontFamily={fonts.regular}
                        marginTop={10}
                        fontSize={16}
                    />
                </View>

                {getImageUrl(currentQuestion) ? (
                    <ImageFast
                        source={getImageUrl(currentQuestion)}
                        resizeMode={'contain'}
                        style={styles.icon}
                    />
                ) : null}

                {currentQuestion.options.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.option,
                            getOptionStyle(index)
                        ]}
                        onPress={() => handleOptionSelect(index)}
                        disabled={(showFeedback && !mockuptest) || isTransitioning}
                    >
                        <CustomText
                            textAlign={'center'}
                            label={option.answer}
                            fontFamily={fonts.regular}
                            fontSize={14}
                            color={'#707070'}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.btnContainer}>
                <View style={styles.btn}>
                    {!shouldShowFeedback ? (
                        <>
                            <CustomButton
                                width={149}
                                height={52}
                                fontSize={16}
                                title={t("skip")}
                                color={'black'}
                                borderColor={'#ECEFF3'}
                                borderWidth={2}
                                borderRadius={25}
                                onPress={handleSkip}
                                disabled={isTransitioning}
                                backgroundColor={"white"}
                            />
                            <CustomButton
                                disabled={(selectedOption === null && !mockuptest) || isTransitioning}
                                width={149}
                                height={52}
                                fontSize={16}
                                title={t("nextButton")}
                                color={'white'}
                                borderColor={'#ECEFF3'}
                                borderWidth={1}
                                borderRadius={25}
                                backgroundColor={'black'}
                                onPress={handleNextOrSubmit}
                            />
                        </>
                    ) : (
                        <>
                            <CustomButton
                                width={149}
                                height={52}
                                fontSize={16}
                                title={t("skip")}
                                color={'black'}
                                borderColor={'#ECEFF3'}
                                borderWidth={2}
                                borderRadius={25}
                                backgroundColor={"white"}
                                onPress={handleSkip}
                            />
                            <CustomButton
                                width={149}
                                height={52}
                                fontSize={16}
                                title={t("nextButton")}
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
        paddingBottom: 10
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
        width: 181,
        alignSelf: 'center',
        marginBottom: 5
    },
    option: {
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#ECEFF3',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        paddingHorizontal: 5,
        paddingVertical: 15,
        borderRadius: 8
    },
    selectedOption: {
        borderColor: COLORS.btn,
        borderWidth: 2,
        backgroundColor: '#EFEFEF'
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
    },
    btn: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'space-between'
    },
    audio: {
        height: 23,
        width: 23
    },
    audioElement: {
        width: 0,
        height: 0
    }
});
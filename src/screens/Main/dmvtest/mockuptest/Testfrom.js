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

const Testfrom = ({ 
    timercomplete, 
    resettimer, 
    mockuptest = false, 
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
        // Set lesson mode based on props
        setIsLessonMode(lesson_id && lesson);
        if (initialQuestions && initialQuestions.length > 0) {
            // If initial questions are provided, parse them directly
            parseQuestions(initialQuestions);
            setTotalQuestionsCount(totalQuestions || initialQuestions.length);
            setIsLoading(false);
        } else {
            // Otherwise load questions via pagination
            loadSavedProgress();
        }
    }, [initialQuestions]);

    useEffect(() => {
        if (allAnswers.length > 0 || currentPageIndex > 1) {
            saveProgressToStorage();
        }
    }, [allAnswers, currentPageIndex, currentQuestionIndex, score, totalTime, totalQuestionsAnswered]);

    // Debug useEffect
    useEffect(() => {
        console.log('Pagination Debug:', {
            currentPageIndex,
            currentQuestionIndex,
            parsedQuestionsLength: parsedQuestions.length,
            totalQuestionsAnswered,
            totalQuestionsCount,
            allAnswersLength: allAnswers.length,
            isLessonMode,
            currentQuestionNumber: totalQuestionsAnswered + currentQuestionIndex + 1
        });
    }, [currentPageIndex, currentQuestionIndex, parsedQuestions.length, totalQuestionsAnswered]);

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
            
            const Body = {
                type: "get_data",
                table_name: "questions",
                is_mockup: mockuptest,
                page: pageIndex,
                limit: 10
            };

            // For both lesson and non-lesson mode, use pagination
            if (lesson_id && lesson) {
                Body.lesson_id = lesson_id;
                Body.page = pageIndex;
                console.log("Loading lesson questions with page:", pageIndex, "lesson_id:", lesson_id);
            } else {
                Body.page = pageIndex;
                console.log("Loading questions with page:", pageIndex);
            }

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
                
                // Update total questions count from API response if available
                if (response.data.total) {
                    setTotalQuestionsCount(response.data.total);
                }
                
                console.log(`Loaded ${newQuestions.length} questions for page ${pageIndex}, total: ${response.data.total || totalQuestionsCount}`);
            } else {
                // Only submit if we have answers and no more questions
                if (allAnswers.length > 0) {
                    console.log("No more questions found, submitting answers");
                    await submitAllAnswers();
                } else {
                    Alert.alert('No Questions', 'No questions found.');
                    setIsLoading(false);
                }
            }
        } catch (error) {
            console.error("Error loading questions:", error);
            if (allAnswers.length > 0) {
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
            // Move to next question in current page
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
            // Last question in current page
            const endTime = Date.now();
            const startTime = questionStartTimes[currentQuestionIndex] || endTime;
            const timeTaken = (endTime - startTime) / 1000;
            setTotalTime(prevTotal => prevTotal + timeTaken);
            
            // Calculate if we have more questions to load
            const totalAnsweredSoFar = totalQuestionsAnswered + parsedQuestions.length;
            const hasMoreQuestions = totalAnsweredSoFar < totalQuestionsCount;
            
            console.log(`Current page completed. Total answered: ${totalAnsweredSoFar}, Total questions: ${totalQuestionsCount}, Has more: ${hasMoreQuestions}`);
            
            if (hasMoreQuestions) {
                // Load next page - for both lesson and non-lesson mode
                setTotalQuestionsAnswered(totalAnsweredSoFar);
                setShowFeedback(false);
                setIsTransitioning(false);
                setSelectedOption(null);
                
                // Load next page
                loadQuestions(currentPageIndex + 1, 0);
            } else {
                // No more questions, submit answers
                setTotalQuestionsAnswered(totalAnsweredSoFar);
                setShowFeedback(false);
                setIsTransitioning(false);
                setSelectedOption(null);
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
            // Skip to next question in current page
            setQuestionStartTimes(prev => ({
                ...prev,
                [currentQuestionIndex + 1]: Date.now()
            }));

            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setShowFeedback(false);
            setSelectedOption(null);
            resettimer(true);
        } else {
            // Last question in current page
            const totalAnsweredSoFar = totalQuestionsAnswered + parsedQuestions.length;
            const hasMoreQuestions = totalAnsweredSoFar < totalQuestionsCount;
            
            console.log(`Skip - Current page completed. Total answered: ${totalAnsweredSoFar}, Total questions: ${totalQuestionsCount}, Has more: ${hasMoreQuestions}`);
            
            if (hasMoreQuestions) {
                // Load next page
                setTotalQuestionsAnswered(totalAnsweredSoFar);
                setShowFeedback(false);
                setSelectedOption(null);
                loadQuestions(currentPageIndex + 1, 0);
            } else {
                // No more questions, submit
                setTotalQuestionsAnswered(totalAnsweredSoFar);
                setShowFeedback(false);
                setSelectedOption(null);
                submitAllAnswers();
            }
        }
    };

    const handleOptionSelect = (index) => {
        if (!isTransitioning && !showFeedback) {
            setSelectedOption(index);
            
            // For both mockup and normal tests, save immediately
            const currentQuestion = parsedQuestions[currentQuestionIndex];
            const alreadySaved = allAnswers.some(ans => ans.question_id === currentQuestion.id);
            
            if (!alreadySaved) {
                saveCurrentAnswer(index);
            }

            // Only show feedback for normal tests, not for mockup tests
            if (!mockuptest) {
                setShowFeedback(true);
            }
        }
    };

    const saveCurrentAnswer = (answerIndex) => {
        const currentQuestion = parsedQuestions[currentQuestionIndex];
        const isCorrect = answerIndex === currentQuestion.correctAnswerIndex;
        
        const answerData = {
            question_id: currentQuestion.id,
            selected_option: answerIndex,
            is_correct: isCorrect,
            skiped: answerIndex === null ? 1 : 0,
            timestamp: Date.now(),
            is_mockup: mockuptest,
            is_lesson: isLessonMode
        };

        setAllAnswers(prev => {
            const filtered = prev.filter(ans => ans.question_id !== currentQuestion.id);
            const newAnswers = [...filtered, answerData];
            return newAnswers;
        });
        
        if (isCorrect) {
            setScore(prevScore => prevScore + 1);
        }
    };

    const getOptionStyle = (index) => {
        const isSelected = selectedOption === index;
        const isCorrect = index === parsedQuestions[currentQuestionIndex]?.correctAnswerIndex;

        // Show feedback only for normal tests, not for mockup tests
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

            // Store mockup results separately
            if (mockuptest) {
                const mockupResults = {
                    score: score,
                    totalQuestions: allAnswers.length,
                    averageTime: finalAverageTime,
                    answers: allAnswers,
                    timestamp: Date.now(),
                    date: new Date().toISOString()
                };

                // Save mockup results to separate storage
                await AsyncStorage.setItem(STORAGE_KEYS.MOCKUP_RESULTS, JSON.stringify(mockupResults));

                // Navigate to mockup results screen
                navigation.replace('MockupResults', {
                    score: score,
                    totalQuestions: allAnswers.length,
                    averageTime: finalAverageTime,
                    answers: allAnswers,
                    isMockup: true
                });
            } else {
                // Normal test submission
                const Body = {
                    type: "add_data",
                    user_id: token,
                    table_name: 'user_questionnaire',
                    questions: JSON.stringify(allAnswers),
                    score: score,
                    average_time: finalAverageTime,
                    is_mockup: false,
                    is_lesson: isLessonMode,
                    lesson_id: isLessonMode ? lesson_id : null
                };

                const response = await ApiRequest(Body);

                await clearSavedProgress();

                navigation.replace('Congratulations', {
                    score: score,
                    totalQuestions: allAnswers.length,
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

    const handleNextOrSubmit = () => {
        // Calculate if this is the last question in the entire set
        const totalAnsweredSoFar = totalQuestionsAnswered + currentQuestionIndex + 1;
        const isLastQuestionOverall = totalAnsweredSoFar >= totalQuestionsCount;
        
        console.log(`Next/Submit - Current index: ${currentQuestionIndex}, Page questions: ${parsedQuestions.length}, Total answered: ${totalAnsweredSoFar}, Total questions: ${totalQuestionsCount}, Is last overall: ${isLastQuestionOverall}`);
        
        if (isLastQuestionOverall) {
            // This is the very last question overall, submit answers
            submitAllAnswers();
        } else if (currentQuestionIndex === parsedQuestions.length - 1) {
            // Last question in current page, but more pages available
            moveToNextQuestion(); // This will handle loading next page
        } else {
            // Regular next question in current page
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
                        label={`Question ${currentQuestionNumber}/${totalQuestionsCount}`}
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
                                title={"Skip"}
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
                                title={"Next"}
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
                                title={"Skip"}
                                color={'black'}
                                borderColor={'#ECEFF3'}
                                borderWidth={2}
                                borderRadius={25}
                                backgroundColor={"white"}
                                onPress={handleSkip}
                                disabled={isTransitioning}
                            />
                            <CustomButton
                                width={149}
                                height={52}
                                fontSize={16}
                                title={"Next"}
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
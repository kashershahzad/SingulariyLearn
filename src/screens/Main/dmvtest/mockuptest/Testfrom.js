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

const Testfrom = ({ timercomplete, resettimer, mockuptest = false, totalQuestions }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [parsedQuestions, setParsedQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [submitloading, setsubmitloading] = useState(false);
    
    // Store ALL answers across all pages
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

    // Local storage keys
    const STORAGE_KEYS = {
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

    // Load saved progress and questions on mount
    useEffect(() => {
        loadSavedProgress();
    }, []);

    // Save progress whenever important states change
    useEffect(() => {
        if (allAnswers.length > 0 || currentPageIndex > 1) {
            saveProgressToStorage();
        }
    }, [allAnswers, currentPageIndex, currentQuestionIndex, score, totalTime, totalQuestionsAnswered]);

    const loadSavedProgress = async () => {
        try {
            setIsLoading(true);
            
            // Load all saved data from local storage
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

            console.log('=== LOCAL STORAGE CONTENTS ===');
            console.log('savedAnswers:', savedAnswers);
            console.log('savedProgress:', savedProgress);
            console.log('savedScore:', savedScore);
            console.log('savedTotalTime:', savedTotalTime);
            console.log('savedCurrentPage:', savedCurrentPage);
            console.log('savedTotalAnswered:', savedTotalAnswered);
            console.log('==============================');

            if (savedAnswers && savedProgress) {
                // Parse saved data
                const answers = JSON.parse(savedAnswers);
                const progress = JSON.parse(savedProgress);
                
                console.log('📊 LOADED SAVED PROGRESS:');
                console.log('Progress data:', progress);
                console.log('Answers count:', answers.length);
                console.log('Current question index:', progress.currentQuestionIndex);
                console.log('Current page index:', progress.currentPageIndex);
                console.log('Score:', savedScore);
                console.log('Total time:', savedTotalTime);
                console.log('Total questions answered:', savedTotalAnswered);

                // Restore all states
                setAllAnswers(answers);
                setScore(savedScore ? parseInt(savedScore) : 0);
                setTotalTime(savedTotalTime ? parseFloat(savedTotalTime) : 0);
                setCurrentPageIndex(savedCurrentPage ? parseInt(savedCurrentPage) : 1);
                setTotalQuestionsAnswered(savedTotalAnswered ? parseInt(savedTotalAnswered) : 0);

                // Load questions from the saved page
                await loadQuestions(savedCurrentPage ? parseInt(savedCurrentPage) : 1, progress.currentQuestionIndex);
            } else {
                console.log('🚀 No saved progress found, starting fresh');
                // No saved progress, start fresh
                await loadQuestions(1);
            }
        } catch (error) {
            console.error('❌ Error loading saved progress:', error);
            // Start fresh if there's an error
            await loadQuestions(1);
        }
    };

    const saveProgressToStorage = async () => {
        try {
            const progressData = {
                currentQuestionIndex,
                currentPageIndex,
                timestamp: Date.now(),
                date: new Date().toISOString()
            };

            console.log('💾 SAVING PROGRESS TO STORAGE:');
            console.log('Current question index:', currentQuestionIndex);
            console.log('Current page index:', currentPageIndex);
            console.log('Total answers:', allAnswers.length);
            console.log('Score:', score);
            console.log('Total time:', totalTime);
            console.log('Total questions answered:', totalQuestionsAnswered);

            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEYS.ALL_ANSWERS, JSON.stringify(allAnswers)),
                AsyncStorage.setItem(STORAGE_KEYS.CURRENT_PROGRESS, JSON.stringify(progressData)),
                AsyncStorage.setItem(STORAGE_KEYS.SCORE, score.toString()),
                AsyncStorage.setItem(STORAGE_KEYS.TOTAL_TIME, totalTime.toString()),
                AsyncStorage.setItem(STORAGE_KEYS.CURRENT_PAGE, currentPageIndex.toString()),
                AsyncStorage.setItem(STORAGE_KEYS.TOTAL_ANSWERED, totalQuestionsAnswered.toString())
            ]);

            // Verify the save by reading back
            const verifySave = async () => {
                const [verifiedAnswers, verifiedProgress] = await Promise.all([
                    AsyncStorage.getItem(STORAGE_KEYS.ALL_ANSWERS),
                    AsyncStorage.getItem(STORAGE_KEYS.CURRENT_PROGRESS)
                ]);
                
                console.log('✅ VERIFY SAVE - Answers count:', verifiedAnswers ? JSON.parse(verifiedAnswers).length : 0);
                console.log('✅ VERIFY SAVE - Progress:', verifiedProgress ? JSON.parse(verifiedProgress) : 'None');
            };

            verifySave();

            console.log('✅ Progress saved successfully');
        } catch (error) {
            console.error('❌ Error saving progress:', error);
        }
    };

    const clearSavedProgress = async () => {
        try {
            console.log('🗑️ Clearing all saved progress from storage');
            
            await Promise.all([
                AsyncStorage.removeItem(STORAGE_KEYS.ALL_ANSWERS),
                AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_PROGRESS),
                AsyncStorage.removeItem(STORAGE_KEYS.SCORE),
                AsyncStorage.removeItem(STORAGE_KEYS.TOTAL_TIME),
                AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_PAGE),
                AsyncStorage.removeItem(STORAGE_KEYS.TOTAL_ANSWERED)
            ]);

            console.log('✅ Progress cleared successfully');
        } catch (error) {
            console.error('❌ Error clearing progress:', error);
        }
    };

    const loadQuestions = async (pageIndex, savedQuestionIndex = 0) => {
        try {
            setIsLoading(true);
            
            const Body = {
                type: "get_data",
                table_name: "questions",
                is_mockup: mockuptest,
                last_id: pageIndex
            };

            console.log("📥 Loading questions with page:", pageIndex, "and question index:", savedQuestionIndex);
            const response = await ApiRequest(Body);
            console.log("📥 API response data count:", response.data?.data?.length || 0);
            
            if (response.data && response.data.data && response.data.data.length > 0) {
                const newQuestions = response.data.data;
                parseQuestions(newQuestions);
                setCurrentPageIndex(pageIndex);
                
                // Restore the saved question index or start from 0
                setCurrentQuestionIndex(savedQuestionIndex);
                setSelectedOption(null);
                setShowFeedback(false);
                
                // Initialize timing for the current question
                setQuestionStartTimes({ [savedQuestionIndex]: Date.now() });
                resettimer(true);

                console.log(`✅ Loaded page ${pageIndex}, question ${savedQuestionIndex + 1} of ${newQuestions.length}`);
            } else {
                // No more questions available - submit all answers
                console.log("🎯 No more questions available, submitting all answers");
                await submitAllAnswers();
            }
        } catch (error) {
            console.error("❌ API Error loading questions:", error);
            // If error and we have answers, submit them
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
                console.error('Error parsing question:', error);
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
        
        console.log(`✅ Parsed ${parsed.length} questions for language: ${currentLanguage}`);
    };

    useEffect(() => {
        if (currentQuestionIndex > 0 && totalTime > 0) {
            setAverageTime(totalTime / (totalQuestionsAnswered + currentQuestionIndex));
        }
    }, [totalTime, currentQuestionIndex, totalQuestionsAnswered]);

    const moveToNextQuestion = () => {
        if (currentQuestionIndex < parsedQuestions.length - 1) {
            // Move to next question in current batch
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
            setSelectedOption(null); // Clear selection for next question
            resettimer(true);

            console.log(`➡️ Moving to next question: ${nextIndex + 1} of ${parsedQuestions.length}`);
        } else {
            // Last question of current batch - load next batch
            console.log('🔄 Last question in current batch, loading next page');
            
            // Calculate time for last question
            const endTime = Date.now();
            const startTime = questionStartTimes[currentQuestionIndex] || endTime;
            const timeTaken = (endTime - startTime) / 1000;
            setTotalTime(prevTotal => prevTotal + timeTaken);
            
            // Update total questions answered
            setTotalQuestionsAnswered(prev => prev + parsedQuestions.length);
            
            // Reset states before loading next page
            setShowFeedback(false);
            setIsTransitioning(false);
            setSelectedOption(null);
            
            // Load next page starting from question 0
            loadQuestions(currentPageIndex + 1, 0);
        }
    };

    const handleSkip = () => {
        const endTime = Date.now();
        const startTime = questionStartTimes[currentQuestionIndex] || endTime;
        const timeTaken = (endTime - startTime) / 1000;
        setTotalTime(prevTotal => prevTotal + timeTaken);

        // Save skipped answer (null) only if not already saved
        const currentQuestion = parsedQuestions[currentQuestionIndex];
        const alreadySaved = allAnswers.some(ans => ans.question_id === currentQuestion.id);
        
        if (!alreadySaved) {
            saveCurrentAnswer(null);
            console.log(`⏭️ Skipped question ${currentQuestionIndex + 1}, question_id: ${currentQuestion.id}`);
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
            // Last question - load next batch
            setTotalQuestionsAnswered(prev => prev + parsedQuestions.length);
            loadQuestions(currentPageIndex + 1, 0);
        }
    };

    const handleOptionSelect = (index) => {
        if (!isTransitioning && !showFeedback) {
            setSelectedOption(index);
            console.log(`🔘 Selected option ${index} for question ${currentQuestionIndex + 1}`);
            
            if (mockuptest) {
                // For mockup test: Save answer but don't show feedback
                const currentQuestion = parsedQuestions[currentQuestionIndex];
                const alreadySaved = allAnswers.some(ans => ans.question_id === currentQuestion.id);
                
                if (!alreadySaved) {
                    saveCurrentAnswer(index);
                }
                // Don't set showFeedback for mockup tests
            } else {
                // For regular test: Immediately show feedback and save answer
                setShowFeedback(true);
                
                // Save the answer immediately
                const currentQuestion = parsedQuestions[currentQuestionIndex];
                const alreadySaved = allAnswers.some(ans => ans.question_id === currentQuestion.id);
                
                if (!alreadySaved) {
                    saveCurrentAnswer(index);
                }
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
            timestamp: Date.now()
        };

        console.log(`💾 Saving answer for question ${currentQuestionIndex + 1}:`, {
            question_id: currentQuestion.id,
            selected_option: answerIndex,
            is_correct: isCorrect,
            skipped: answerIndex === null
        });

        // Add to allAnswers array, avoiding duplicates
        setAllAnswers(prev => {
            const filtered = prev.filter(ans => ans.question_id !== currentQuestion.id);
            const newAnswers = [...filtered, answerData];
            console.log(`📊 Total answers now: ${newAnswers.length}`);
            return newAnswers;
        });
        
        // Update score if correct
        if (isCorrect) {
            setScore(prevScore => {
                const newScore = prevScore + 1;
                console.log(`🎯 Correct answer! Score updated to: ${newScore}`);
                return newScore;
            });
        }
    };

    const getOptionStyle = (index) => {
        const isSelected = selectedOption === index;
        const isCorrect = index === parsedQuestions[currentQuestionIndex]?.correctAnswerIndex;

        // Only show feedback styles if it's NOT a mockup test AND feedback is showing
        if (showFeedback && !mockuptest) {
            if (isSelected) {
                return isCorrect ? styles.correctOption : styles.incorrectOption;
            }
            if (isCorrect) {
                return styles.correctOption;
            }
        }
        
        // For mockup tests or when no feedback, just show selection
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

            // Calculate final average time
            const finalAverageTime = totalTime / allAnswers.length || 0;

            const Body = {
                type: "add_data",
                user_id: token,
                table_name: 'user_questionnaire',
                questions: JSON.stringify(allAnswers),
                score: score,
                average_time: finalAverageTime
            };

            console.log('🎯 SUBMITTING ALL ANSWERS:');
            console.log('Total answers:', allAnswers.length);
            console.log('Final score:', score);
            console.log('Average time:', finalAverageTime);
            console.log('Submission Body:', Body);

            const response = await ApiRequest(Body);
            console.log('📨 API Response:', response);

            // Clear saved progress after successful submission
            await clearSavedProgress();

            navigation.replace('Congratulations', {
                score: score,
                totalQuestions: allAnswers.length,
                averageTime: finalAverageTime
            });

        } catch (error) {
            console.error('❌ API Error:', error);
            Alert.alert('Error', 'Failed to submit answers. Please try again.');
        } finally {
            setsubmitloading(false);
        }
    };

    const handleNextOrSubmit = () => {
        if (currentQuestionIndex === parsedQuestions.length - 1) {
            // Last question of current batch
            handleNext();
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
    const progressWidth = `${((currentQuestionNumber) / totalQuestions) * 100}%`;
    const currentQuestion = parsedQuestions[currentQuestionIndex];

    // Determine if we should show feedback state in buttons
    const shouldShowFeedback = showFeedback && !mockuptest;

    return (
        <View style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <CustomText
                        label={`Question ${currentQuestionNumber}/${totalQuestions}`}
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
                        onError={() => console.log('Image failed to load')}
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
                                onPress={handleNext}
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
                                backgroundColor={'#ED7D20'}
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
        backgroundColor: '#ED7D20',
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
        borderColor: '#ED7D20',
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
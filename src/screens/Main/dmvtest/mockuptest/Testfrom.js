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

    const togglePlayback = () => {
        setIsPlaying(!isPlaying);
    };

    // Load initial questions on mount
    useEffect(() => {
        loadQuestions(1);
    }, []);

    const loadQuestions = async (pageIndex) => {

        
        try {
            setIsLoading(true);
            
            const Body = {
                type: "get_data",
                table_name: "questions",
                is_mockup: false,
                last_id: pageIndex
            };

            console.log("Loading questions with page:", pageIndex);
            const response = await ApiRequest(Body);
            console.log("API response:", response.data);
            
            if (response.data && response.data.data && response.data.data.length > 0) {
                const newQuestions = response.data.data;
                parseQuestions(newQuestions);
                setCurrentPageIndex(pageIndex);
                setCurrentQuestionIndex(0);
                setSelectedOption(null);
                setShowFeedback(false);
                setQuestionStartTimes({ 0: Date.now() });
                resettimer(true);
            } else {
                // No more questions available - submit all answers
                console.log("No more questions available, submitting all answers");
                await submitAllAnswers();
            }
        } catch (error) {
            console.error("API Error loading questions:", error);
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
        } else {
            // Last question of current batch - load next batch
            console.log('Last question in current batch, loading next page');
            
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
            
            // Load next page
            loadQuestions(currentPageIndex + 1);
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
            loadQuestions(currentPageIndex + 1);
        }
    };

    const handleOptionSelect = (index) => {
        if (!isTransitioning) {
            setSelectedOption(index);
        }
    };

    const saveCurrentAnswer = (answerIndex) => {
        const currentQuestion = parsedQuestions[currentQuestionIndex];
        const isCorrect = answerIndex === currentQuestion.correctAnswerIndex;
        
        const answerData = {
            question_id: currentQuestion.id,
            selected_option: answerIndex,
            is_correct: isCorrect,
            skiped: answerIndex === null ? 1 : 0
        };

        // Add to allAnswers array
        setAllAnswers(prev => [...prev, answerData]);
        
        // Update score if correct
        if (isCorrect) {
            setScore(prevScore => prevScore + 1);
        }
    };

    const getOptionStyle = (index) => {
        const isSelected = selectedOption === index;
        const isCorrect = index === parsedQuestions[currentQuestionIndex]?.correctAnswerIndex;

        if (showFeedback) {
            if (isSelected) {
                return isCorrect ? styles.correctOption : styles.incorrectOption;
            }
            if (isCorrect) {
                return styles.correctOption;
            }
        }
        return isSelected ? styles.selectedOption : styles.option;
    };

    const handleShowAnswer = () => {
        if (selectedOption !== null && !isTransitioning) {
            // Only save if not already saved
            const currentQuestion = parsedQuestions[currentQuestionIndex];
            const alreadySaved = allAnswers.some(ans => ans.question_id === currentQuestion.id);
            
            if (!alreadySaved) {
                saveCurrentAnswer(selectedOption);
            }
            setShowFeedback(true);
        }
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

            console.log('Submitting All Answers:', Body);
            console.log('Total answers:', allAnswers.length);
            console.log('Final score:', score);

            const response = await ApiRequest(Body);
            console.log('API Response:', response);

            navigation.replace('Congratulations', {
                score: score,
                totalQuestions: allAnswers.length,
                averageTime: finalAverageTime
            });

        } catch (error) {
            console.error('API Error:', error);
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
            return console.log('No Audio');
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
                        disabled={showFeedback || isTransitioning}
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
                    {!showFeedback ? (
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
                                disabled={selectedOption === null || isTransitioning}
                                width={149}
                                height={52}
                                fontSize={16}
                                title={"Next"}
                                color={'white'}
                                borderColor={'#ECEFF3'}
                                borderWidth={1}
                                borderRadius={25}
                                backgroundColor={'black'}
                                onPress={handleShowAnswer}
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
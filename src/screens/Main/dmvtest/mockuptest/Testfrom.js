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

const Testfrom = ({ timercomplete, resettimer, questions, mockuptest = false }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [correctAnswers, setCorrectAnswers] = useState([]);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [parsedQuestions, setParsedQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [submitloading, setsubmitloading] = useState(false)
    const [userAnswers, setUserAnswers] = useState([]);
    const navigation = useNavigation();
    const token = useSelector(state => state.authConfig.token)
    const currentLanguage = useSelector(state => state.language.language);

    const [score, setScore] = useState(0);
    const [questionStartTimes, setQuestionStartTimes] = useState({});
    const [totalTime, setTotalTime] = useState(0);
    const [averageTime, setAverageTime] = useState(0);
    const [nullimage, setnullimage] = useState(false)

    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlayback = () => {
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        if (questions && questions.length > 0) {
            const parsed = questions.map(q => {
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

                return {
                    ...q,
                    question: questionText,
                    options: options
                };
            });

            setParsedQuestions(parsed);

            const initialCorrectAnswers = parsed.map(q => {
                const correctIndex = q.options.findIndex(option => option.correct === 1);
                return correctIndex !== -1 ? correctIndex : 0;
            });

            setCorrectAnswers(initialCorrectAnswers);
            setUserAnswers(new Array(parsed.length).fill(null));
            setIsLoading(false);

            setQuestionStartTimes({ 0: Date.now() });
        }
        console.log("Parsed questions for language:", currentLanguage, questions);
    }, [questions, currentLanguage]);

    useEffect(() => {
        setSelectedOption(userAnswers[currentQuestionIndex]);
    }, [currentQuestionIndex, userAnswers]);

    useEffect(() => {
        if (currentQuestionIndex > 0) {
            setAverageTime(totalTime / currentQuestionIndex);
        }
    }, [totalTime, currentQuestionIndex]);

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

            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setShowFeedback(false);
            setIsTransitioning(false);
            resettimer(true);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0 && !isTransitioning) {
            const updatedAnswers = [...userAnswers];
            updatedAnswers[currentQuestionIndex] = null;
            setUserAnswers(updatedAnswers);

            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setShowFeedback(false);
            resettimer(true);
        }
    };

    const handleSkip = () => {
        const endTime = Date.now();
        const startTime = questionStartTimes[currentQuestionIndex] || endTime;
        const timeTaken = (endTime - startTime) / 1000;
        setTotalTime(prevTotal => prevTotal + timeTaken);

        saveCurrentAnswer();

        if (currentQuestionIndex < parsedQuestions.length - 1) {
            setQuestionStartTimes(prev => ({
                ...prev,
                [currentQuestionIndex + 1]: Date.now()
            }));

            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setShowFeedback(false);
            resettimer(true);
        } else {
            handleSubmit();
        }
    };

    const handleOptionSelect = (index) => {
        if (!isTransitioning) {
            setSelectedOption(index);
            saveAnswer(index);
        }
    };

    const saveCurrentAnswer = () => {
        if (selectedOption !== null) {
            saveAnswer(selectedOption);
        }
    };

    const saveAnswer = (answerIndex) => {
        const updatedAnswers = [...userAnswers];
        updatedAnswers[currentQuestionIndex] = answerIndex;
        setUserAnswers(updatedAnswers);
    };

    const getOptionStyle = (index) => {
        const isSelected = selectedOption === index;
        const isCorrect = index === correctAnswers[currentQuestionIndex];

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
            saveCurrentAnswer();
            if (selectedOption === correctAnswers[currentQuestionIndex]) {
                setScore(prevScore => prevScore + 1);
            }
            setShowFeedback(true);
        }
    };

    const handleNext = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            moveToNextQuestion();
        }, 100); // Short delay for smooth transition
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

    const handleSubmit = async () => {
        try {
            setsubmitloading(true);

            const finalScore = userAnswers.reduce((total, answer, index) => {
                return total + (answer === correctAnswers[index] ? 1 : 0);
            }, 0);

            if (selectedOption !== null && userAnswers[currentQuestionIndex] === null) {
                const updatedAnswers = [...userAnswers];
                updatedAnswers[currentQuestionIndex] = selectedOption;
                setUserAnswers(updatedAnswers);

                const finalScoreWithLastAnswer = updatedAnswers.reduce((total, answer, index) => {
                    return total + (answer === correctAnswers[index] ? 1 : 0);
                }, 0);

                setScore(finalScoreWithLastAnswer);
            } else {
                setScore(finalScore);
            }

            const answersData = parsedQuestions.map((question, index) => ({
                question_id: question.id,
                selected_option: userAnswers[index],
                is_correct: userAnswers[index] === correctAnswers[index],
                skiped: userAnswers[index] === null ? 1 : 0
            }));

            const Body = {
                type: "add_data",
                user_id: token,
                table_name: 'user_questionnaire',
                questions: JSON.stringify(answersData),
                score: finalScore,
                average_time: averageTime
            };

            console.log('Submitting Answers:', Body);

            const response = await ApiRequest(Body);
            console.log('API Response:', response);

            navigation.replace('Congratulations', {
                score: finalScore,
                totalQuestions: parsedQuestions.length,
                averageTime: averageTime
            });

        } catch (error) {
            console.error('API Error:', error);
            Alert.alert('Error', 'Failed to submit answers. Please try again.');
        } finally {
            setsubmitloading(false);
        }
    };

    if (isLoading || parsedQuestions.length === 0 || submitloading) {
        return (
            <View style={[styles.centerContent]}>
                <ActivityIndicator size="large" color={COLORS.primaryColor4} />
            </View>
        );
    }

    const progressWidth = `${((currentQuestionIndex + 1) / parsedQuestions.length) * 100}%`;
    const currentQuestion = parsedQuestions[currentQuestionIndex];

    const getAudioUrl = (question) => {
        try {
            const audioData = JSON.parse(question.audio);
            return audioData[currentLanguage] ;
            console.log("Audio Data:", audioData);
        } catch (error) {
            return question.audio || '';
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <CustomText
                        label={`Question ${currentQuestionIndex + 1}/${parsedQuestions.length}`}
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
                        // Normal state - user hasn't submitted answer yet
                        <>
                            <CustomButton
                                width={currentQuestionIndex >= 1 ? 100 : 149}
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
                            {
                                currentQuestionIndex >= 1 ? <CustomButton
                                    width={100}
                                    height={52}
                                    fontSize={16}
                                    title={'Back'}
                                    color={'black'}
                                    borderColor={'#ECEFF3'}
                                    borderWidth={1}
                                    borderRadius={25}
                                    onPress={handleBack}
                                    disabled={currentQuestionIndex === 0 || isTransitioning}
                                /> : null
                            }
                            <CustomButton
                                disabled={selectedOption === null || isTransitioning}
                                width={currentQuestionIndex >= 1 ? 100 : 149}
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
                        // Feedback state - answer has been shown
                        <>
                            <CustomButton
                                width={currentQuestionIndex >= 1 ? 100 : 149}
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
                            {
                                currentQuestionIndex >= 1 ? <CustomButton
                                    width={100}
                                    height={52}
                                    fontSize={16}
                                    title={'Back'}
                                    color={'black'}
                                    borderColor={'#ECEFF3'}
                                    borderWidth={1}
                                    borderRadius={25}
                                    onPress={handleBack}
                                    disabled={currentQuestionIndex === 0 || isTransitioning}
                                /> : null
                            }
                            <CustomButton
                                width={currentQuestionIndex >= 1 ? 100 : 149}
                                height={52}
                                fontSize={16}
                                title={currentQuestionIndex === parsedQuestions.length - 1 ? "Submit" : "Next"}
                                color={'white'}
                                borderColor={'#ECEFF3'}
                                borderWidth={1}
                                borderRadius={25}
                                backgroundColor={'#ED7D20'}
                                onPress={handleNext}
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
    }
});
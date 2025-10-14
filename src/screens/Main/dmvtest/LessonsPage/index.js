import { StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../../../../components/ScreenWrapper'
import { COLORS } from '../../../../utils/COLORS'
import Testfrom from '../mockuptest/Testfrom'
import { useTranslation } from 'react-i18next'
import MockupHeader from '../Molecules/MockupHeader'
import { ApiRequest } from '../../../../services/ApiRequest'

const LessonPage = ({ route, navigation }) => {
    const { t } = useTranslation();
    const [questiontimer, setquestiontimer] = useState(false)
    const [resettimer, setresettimer] = useState(false)
    const [questions, setQuestions] = useState([]);
    const [error, seterror] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [totalQuestion, settotalQuestion] = useState('')

    const { lesson_id, name } = route.params;

    useEffect(() => {
        const fetchquestion = async () => {
            try {
                const Body = {
                    type: "get_data",
                    table_name: "questions",
                    lesson_id: lesson_id
                }

                const response = await ApiRequest(Body)
                console.log("Lesson questions response", response.data); 
                
                if (response.data && response.data.data) {
                    setQuestions(response.data.data);
                    settotalQuestion(response.data.data.length);
                    seterror(false);
                } else {
                    seterror(true);
                }
            } catch (error) {
                console.error("API Error:", error);
                seterror(true);
            } finally {
                setIsLoading(false);
            }
        }
        fetchquestion()
    }, [lesson_id])

    return (
        <ScreenWrapper
            scrollEnabled
            statusBarColor={COLORS.primaryColor4}
            paddingHorizontal={0}>
            {!isLoading && !error && (
                <>
                    <MockupHeader
                        setreset={setresettimer}
                        resettimer={resettimer}
                        timercomplete={setquestiontimer}
                        timer={false}
                        title={name} 
                    />
                    
                    <Testfrom 
                        resettimer={setresettimer} 
                        timercomplete={questiontimer} 
                        questions={questions} 
                        totalQuestions={totalQuestion}
                        lesson_id={lesson_id}
                        lesson={true}
                    />
                </>
            )}

            {/* Error State */}
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error loading questions</Text>
                </View>
            )}

            {/* Loading State */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading questions...</Text>
                </View>
            )}
        </ScreenWrapper>
    )
}

export default LessonPage

const styles = StyleSheet.create({
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: COLORS.red,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        color: COLORS.primaryColor4,
        textAlign: 'center',
    },
})
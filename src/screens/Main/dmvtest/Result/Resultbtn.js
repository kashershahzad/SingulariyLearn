import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useMemo, useEffect } from 'react';
import CustomText from '../../../../components/CustomText';
import fonts from '../../../../assets/fonts';
import { COLORS } from '../../../../utils/COLORS';
import { useTranslation } from 'react-i18next';

const Resultbtn = ({ attempts, currentAttempt, onAttemptChange }) => {
    const { t } = useTranslation();
    const [selectedAttempt, setSelectedAttempt] = useState(currentAttempt || 1);

    // Sync with parent component's currentAttempt
    useEffect(() => {
        console.log('🔄 CHILD: Received new currentAttempt:', currentAttempt);
        setSelectedAttempt(currentAttempt || 1);
    }, [currentAttempt]);

    // Generate array in ASCENDING order with consistent "Attempt X" labels
    const tattempts = useMemo(() => {
        // console.log('🔄 CHILD: Generating attempts array in ASCENDING order');
        // console.log('🔄 CHILD: Total attempts:', attempts);
        
        // Create array with length = attempts in ASCENDING order
        const generatedAttempts = Array.from({ length: attempts }, (_, index) => {
            const attemptNumber = index + 1; // Ascending order: 1, 2, 3, ...
            const attemptData = {
                id: attemptNumber,
                label: `Attempt ${attemptNumber}` // Always use "Attempt X" format
            };
            
            // console.log(`   - Generated attempt ${index + 1}:`, attemptData);
            return attemptData;
        });

        // console.log('🔄 CHILD: Final generated attempts (ASCENDING):', generatedAttempts);
        return generatedAttempts;
    }, [attempts]);

    const handleAttemptSelect = (attemptId) => {
        // console.log('🎯 CHILD: User selected attempt:', attemptId);
        // console.log('🎯 CHILD: Previous selected attempt:', selectedAttempt);
        
        setSelectedAttempt(attemptId);
        if (onAttemptChange) {
            console.log('🎯 CHILD: Calling parent callback with attempt:', attemptId);
            onAttemptChange(attemptId);
        }
    };

    // console.log('🔄 CHILD RENDER - Selected Attempt:', selectedAttempt);
    // console.log('🔄 CHILD RENDER - Total Attempts:', attempts);
    // console.log('🔄 CHILD RENDER - Generated Attempts Count:', tattempts.length);

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.buttonContainer}
        >
            {tattempts.map((attempt) => (
                <TouchableOpacity
                    key={attempt.id}
                    style={[
                        styles.button,
                        selectedAttempt === attempt.id && styles.selectedButton
                    ]}
                    onPress={() => handleAttemptSelect(attempt.id)}
                    activeOpacity={0.7}
                >
                    <CustomText
                        label={attempt.label}
                        color={selectedAttempt === attempt.id ? COLORS.white : COLORS.gray}
                        fontFamily={fonts.medium}
                        fontSize={12}
                        textAlign={'center'}
                    />
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

export default Resultbtn;

const styles = StyleSheet.create({
    buttonContainer: {
        paddingVertical: 16,
        gap: 12,
        paddingHorizontal: 16,
    },
    button: {
        height: 29,
        minWidth: 103,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    selectedButton: {
        backgroundColor: COLORS.black,
        borderColor: COLORS.black,
    }
});
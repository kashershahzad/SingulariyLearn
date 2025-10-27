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

    // Fixed: Generate array in REVERSE order (latest first)
    const tattempts = useMemo(() => {
        const labels = t('attemptLabels', { returnObjects: true }) || [];
        
        // console.log('🔄 CHILD: Generating attempts array in REVERSE order');
        // console.log('🔄 CHILD: Total attempts:', attempts);
        // console.log('🔄 CHILD: Translation labels length:', labels.length);
        
        // Create array with length = attempts in REVERSE order
        const generatedAttempts = Array.from({ length: attempts }, (_, index) => {
            const attemptNumber = attempts - index; // Reverse order: latest = 1, oldest = attempts
            const attemptData = {
                id: attemptNumber, // This maintains the original attempt number
                // Use label from translation if available, otherwise fallback with reverse numbering
                label: labels[attemptNumber - 1] || `Attempt ${attemptNumber}`
            };
            
            // console.log(`   - Generated attempt ${index + 1}:`, attemptData);
            return attemptData;
        });

        // console.log('🔄 CHILD: Final generated attempts (REVERSE):', generatedAttempts);
        return generatedAttempts;
    }, [t, attempts]);

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
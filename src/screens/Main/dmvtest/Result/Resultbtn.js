import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import CustomText from '../../../../components/CustomText';
import fonts from '../../../../assets/fonts';
import { COLORS } from '../../../../utils/COLORS';
import { useTranslation } from 'react-i18next';

const Resultbtn = () => {
    const { t } = useTranslation();
    const [selectedAttempt, setSelectedAttempt] = useState(1);

    const attempts = t('attemptLabels', { returnObjects: true }).map((label, index) => ({
        id: index + 1,
        label: label
    }));

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.buttonContainer}
        >
            {attempts.map((attempt) => (
                <TouchableOpacity
                    key={attempt.id}
                    style={[
                        styles.button,
                        selectedAttempt === attempt.id && styles.selectedButton
                    ]}
                    onPress={() => setSelectedAttempt(attempt.id)}
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
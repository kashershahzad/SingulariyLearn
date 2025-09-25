import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomButton from '../../../../components/CustomButton';

const TestButtons = ({
    showFeedback,
    isTransitioning,
    currentQuestionIndex,
    parsedQuestionsLength,
    selectedOption,
    onSkip,
    onBack,
    onNext,
    onSubmit
}) => {
    if (showFeedback) {
        return null;
    }

    return (
        <View style={styles.footer}>
            <View style={styles.btn}>
                <CustomButton
                    width={currentQuestionIndex >= 1 ? 100 : 149}
                    height={52}
                    fontSize={16}
                    title={"Skip"}
                    color={'black'}
                    borderColor={'#ECEFF3'}
                    borderWidth={2}
                    borderRadius={25}
                    onPress={onSkip}
                    disabled={isTransitioning}
                />
                {
                    currentQuestionIndex >= 1 ? (
                        <CustomButton
                            width={100}
                            height={52}
                            fontSize={16}
                            title={'Back'}
                            color={'black'}
                            borderColor={'#ECEFF3'}
                            borderWidth={1}
                            borderRadius={25}
                            onPress={onBack}
                            disabled={currentQuestionIndex === 0 || isTransitioning}
                        />
                    ) : null
                }
                <CustomButton
                    disabled={selectedOption === null || isTransitioning}
                    width={currentQuestionIndex >= 1 ? 100 : 149}
                    height={52}
                    fontSize={16}
                    title={currentQuestionIndex === parsedQuestionsLength - 1 ? "Submit" : "Next"}
                    color={'white'}
                    borderColor={'#ECEFF3'}
                    borderWidth={1}
                    borderRadius={25}
                    backgroundColor={'black'}
                    onPress={currentQuestionIndex === parsedQuestionsLength - 1 ? onSubmit : onNext}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#ECEFF3',
        backgroundColor: 'white',
    },
    btn: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'space-between'
    },
});

export default TestButtons;
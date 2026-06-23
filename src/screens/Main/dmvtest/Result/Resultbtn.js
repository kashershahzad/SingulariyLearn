import {StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomText from '../../../../components/CustomText';
import fonts from '../../../../assets/fonts';
import {useTranslation} from 'react-i18next';
import {useTheme, useThemedStyles} from '../../../../theme/useTheme';

const Resultbtn = ({attempts, currentAttempt, onAttemptChange}) => {
  const {t} = useTranslation();
  const {colors} = useTheme();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
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
        borderColor: c.border,
        backgroundColor: c.card,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        shadowColor: c.textPrimary,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      },
      selectedButton: {
        backgroundColor: c.accent,
        borderColor: c.accent,
      },
    }),
  );

  const [selectedAttempt, setSelectedAttempt] = useState(1);

  useEffect(() => {
    if (currentAttempt) {
      setSelectedAttempt(currentAttempt);
    } else {
      setSelectedAttempt(1);
      onAttemptChange?.(1);
    }
  }, [currentAttempt, onAttemptChange]);

  const attemptList = Array.from({length: attempts}).map((_, index) => ({
    id: index + 1,
    label: t('attempt') + ` ${attempts - index}`,
  }));

  const handleSelect = id => {
    setSelectedAttempt(id);
    onAttemptChange?.(id);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.buttonContainer}>
      {attemptList.map(attempt => {
        const isSelected = selectedAttempt === attempt.id;
        return (
          <TouchableOpacity
            key={attempt.id}
            style={[styles.button, isSelected && styles.selectedButton]}
            onPress={() => handleSelect(attempt.id)}
            activeOpacity={0.7}>
            <CustomText
              label={attempt.label}
              color={isSelected ? colors.textOnAccent : colors.textMuted}
              fontFamily={fonts.medium}
              fontSize={12}
              textAlign="center"
            />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default Resultbtn;

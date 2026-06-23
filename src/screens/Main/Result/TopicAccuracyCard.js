import {StyleSheet, View} from 'react-native';
import React from 'react';

import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import {useTheme, useThemedStyles} from '../../../theme/useTheme';

const TopicAccuracyCard = ({
  title,
  subtitle,
  accuracyLabel,
  marginTop = 0,
  marginBottom = 0,
  removeTranslation = false,
}) => {
  const {colors} = useTheme();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
      card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 18,
        backgroundColor: c.card,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: c.border,
      },
      leftCol: {
        flex: 1,
        flexDirection: 'column',
        marginRight: 12,
      },
      badge: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: c.accentBg,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: c.accent,
        justifyContent: 'center',
        alignItems: 'center',
      },
    }),
  );

  return (
    <View style={[styles.card, {marginTop, marginBottom}]}>
      <View style={styles.leftCol}>
        <CustomText
          label={title}
          fontSize={18}
          fontFamily={fonts.jakartaBold}
          color={colors.textPrimary}
          removeTranslation={removeTranslation}
        />
        <CustomText
          label={subtitle}
          fontSize={14}
          fontFamily={fonts.jakartaRegular}
          color={colors.textMuted}
          marginTop={4}
          removeTranslation={removeTranslation}
        />
      </View>
      <View style={styles.badge}>
        <CustomText
          label={accuracyLabel}
          fontSize={10}
          fontFamily={fonts.jakartaSemiBold}
          color={colors.textPrimary}
          removeTranslation={removeTranslation}
        />
      </View>
    </View>
  );
};

export const WeakAreasEmpty = ({marginTop = 20}) => {
  const {colors} = useTheme();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
      emptyCard: {
        width: '100%',
        paddingVertical: 20,
        paddingHorizontal: 18,
        backgroundColor: c.card,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: c.border,
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
  );

  return (
    <View style={[styles.emptyCard, {marginTop}]}>
      <CustomText
        label="screens.result.noWeakAreasYet"
        fontSize={14}
        fontFamily={fonts.jakartaMedium}
        color={colors.textMuted}
        textAlign="center"
      />
    </View>
  );
};

export default TopicAccuracyCard;

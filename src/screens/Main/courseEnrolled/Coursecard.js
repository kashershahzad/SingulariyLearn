import {StyleSheet, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import ImageFast from '../../../components/ImageFast';
import Icons from '../../../components/Icons';
import {Images} from '../../../assets/images';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import {useTheme, useThemedStyles} from '../../../theme/useTheme';

const Coursecard = ({
  image = Images.enrolledcoursepic,
  tag = 'SCIENCE & TECH',
  date = '2 days ago',
  title = 'Driving Permit',
  instructor = 'Dr. Aris Thorne',
  completedLessons = 12,
  totalLessons = 18,
  isCompleted = false,
  showBookmark = false,
  isBookmarked = false,
  bookmarkLoading = false,
  onBookmarkPress,
  onPress,
}) => {
  const {t} = useTranslation();
  const {colors} = useTheme();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
      container: {
        backgroundColor: c.card,
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
        borderWidth: 1,
        borderColor: c.border,
      },
      image: {
        width: '100%',
        height: 169,
        borderRadius: 8,
      },
      imageWrapper: {
        position: 'relative',
      },
      bookmarkButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: c.card,
        borderWidth: 1,
        borderColor: c.border,
        alignItems: 'center',
        justifyContent: 'center',
      },
      bookmarkButtonDisabled: {
        opacity: 0.5,
      },
      progressHeader: {
        marginTop: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      progressTrack: {
        marginTop: 3,
        height: 6,
        borderRadius: 999,
        backgroundColor: c.progressTrack,
        overflow: 'hidden',
      },
      progressFill: {
        height: '100%',
        borderRadius: 999,
        backgroundColor: c.progressFill,
      },
      completedRow: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      },
      checkIcon: {
        width: 20,
        height: 20,
        marginTop: 2,
      },
      actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: c.accent,
        borderRadius: 999,
        padding: 10,
        height: 48,
        marginTop: 20,
        gap: 5,
      },
      outlineActionButton: {
        backgroundColor: c.card,
        borderWidth: 1.5,
        borderColor: c.accent,
      },
      pauseIcon: {
        width: 7,
        height: 9,
      },
      certificateIcon: {
        width: 15,
        height: 15,
        marginTop: 6,
      },
    }),
  );

  const safeTotalLessons = totalLessons || 1;
  const progressPercent = Math.round((completedLessons / safeTotalLessons) * 100);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.container}>
      <View style={styles.imageWrapper}>
        <ImageFast source={image} style={styles.image} resizeMode={'cover'} />
        {showBookmark ? (
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={bookmarkLoading}
            style={[
              styles.bookmarkButton,
              bookmarkLoading && styles.bookmarkButtonDisabled,
            ]}
            onPress={onBookmarkPress}>
            <Icons
              family="Ionicons"
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={colors.accent}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      <CustomText
        label={date}
        removeTranslation
        fontFamily={fonts.jakartaRegular}
        fontSize={12}
        color={colors.textSecondary}
        alignSelf="flex-end"
        marginTop={10}
      />
      <CustomText
        label={title}
        removeTranslation
        fontFamily={fonts.jakartaSemiBold}
        fontSize={32}
        lineHeight={40}
        color={colors.textPrimary}
      />
      <CustomText
        label={`${t('screens.enrolledCourses.instructor')}: ${instructor}`}
        removeTranslation
        fontFamily={fonts.jakartaRegular}
        fontSize={14}
        color={colors.textSecondary}
      />

      {!isCompleted ? (
        <>
          <View style={styles.progressHeader}>
            <CustomText
              label={t('screens.enrolledCourses.percentComplete', {
                value: progressPercent,
              })}
              removeTranslation
              fontFamily={fonts.jakartaSemiBold}
              fontSize={14}
              color={colors.accent}
            />
            <CustomText
              label={t('screens.enrolledCourses.lessonsProgress', {
                completed: completedLessons,
                total: totalLessons,
              })}
              removeTranslation
              fontFamily={fonts.jakartaRegular}
              fontSize={14}
              color={colors.textSecondary}
            />
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, {width: `${progressPercent}%`}]} />
          </View>
        </>
      ) : (
        <View style={styles.completedRow}>
          <ImageFast source={Images.check} style={styles.checkIcon} />
          <CustomText
            label="screens.enrolledCourses.statusCompleted"
            fontFamily={fonts.jakartaSemiBold}
            fontSize={14}
            color={colors.correct}
          />
        </View>
      )}

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[styles.actionButton, isCompleted && styles.outlineActionButton]}>
        {!isCompleted && (
          <ImageFast source={Images.pause} style={styles.pauseIcon} />
        )}
        {isCompleted && (
          <ImageFast source={Images.certificate} style={styles.certificateIcon} />
        )}
        <CustomText
          label={
            isCompleted
              ? 'screens.enrolledCourses.viewCertificate'
              : 'screens.enrolledCourses.resume'
          }
          removeTranslation={false}
          fontFamily={fonts.jakartaSemiBold}
          fontSize={16}
          color={isCompleted ? colors.accent : colors.textOnAccent}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default Coursecard;

import {
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback} from 'react';
import Modal from 'react-native-modal';

import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import {useTheme, useThemedStyles} from '../../../theme/useTheme';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const MODAL_MAX_HEIGHT = SCREEN_HEIGHT * 0.85;
const LIST_HEIGHT = MODAL_MAX_HEIGHT - 88;

const ReviewAnswersModal = ({visible, onClose, reviewAnswers = []}) => {
  const {colors} = useTheme();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
      modal: {
        margin: 20,
        justifyContent: 'center',
      },
      modalCard: {
        width: '100%',
        maxHeight: MODAL_MAX_HEIGHT,
        backgroundColor: c.screenBg,
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        overflow: 'hidden',
      },
      list: {
        height: LIST_HEIGHT,
      },
      listContent: {
        paddingBottom: 8,
      },
      headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      },
      closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: c.chipInactiveBg,
        alignItems: 'center',
        justifyContent: 'center',
      },
      emptyState: {
        height: LIST_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
      },
      questionCard: {
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: c.card,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
      },
      questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
      },
      statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
      },
      answerBlock: {
        marginTop: 8,
      },
    }),
  );

  const hasReviewData = reviewAnswers.length > 0;

  const renderItem = useCallback(
    ({item, index}) => {
      const isSkipped = item.skiped === 1 || item.skipped === 1;
      const isCorrect = item.is_correct === true;

      return (
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <CustomText
              label={`${index + 1}/${reviewAnswers.length}`}
              fontSize={12}
              fontFamily={fonts.jakartaSemiBold}
              color={colors.accent}
              removeTranslation
            />
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isSkipped
                    ? colors.chipInactiveBg
                    : isCorrect
                      ? `${colors.correct}22`
                      : `${colors.wrong}22`,
                },
              ]}>
              <CustomText
                label={
                  isSkipped
                    ? 'screens.result.skipped'
                    : isCorrect
                      ? 'screens.result.correct'
                      : 'screens.result.incorrect'
                }
                fontSize={10}
                fontFamily={fonts.jakartaBold}
                color={
                  isSkipped
                    ? colors.textMuted
                    : isCorrect
                      ? colors.correct
                      : colors.wrong
                }
              />
            </View>
          </View>

          <CustomText
            label={item.question_text || `Question ${item.question_id}`}
            fontSize={14}
            fontFamily={fonts.jakartaMedium}
            color={colors.textPrimary}
            removeTranslation
          />

          {!isSkipped && !!item.selected_answer_text && (
            <View style={styles.answerBlock}>
              <CustomText
                label="screens.result.yourAnswer"
                fontSize={12}
                fontFamily={fonts.jakartaSemiBold}
                color={colors.textSecondary}
              />
              <CustomText
                label={item.selected_answer_text}
                fontSize={13}
                fontFamily={fonts.regular}
                color={isCorrect ? colors.correct : colors.wrong}
                marginTop={2}
                removeTranslation
              />
            </View>
          )}

          {(!isCorrect || isSkipped) && !!item.correct_answer_text && (
            <View style={styles.answerBlock}>
              <CustomText
                label="screens.result.correctAnswer"
                fontSize={12}
                fontFamily={fonts.jakartaSemiBold}
                color={colors.textSecondary}
              />
              <CustomText
                label={item.correct_answer_text}
                fontSize={13}
                fontFamily={fonts.regular}
                color={colors.correct}
                marginTop={2}
                removeTranslation
              />
            </View>
          )}
        </View>
      );
    },
    [colors, reviewAnswers.length, styles],
  );

  const keyExtractor = useCallback(
    (item, index) => String(item.question_id ?? index),
    [],
  );

  return (
    <Modal
      isVisible={visible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      backdropOpacity={0.6}
      style={styles.modal}
      propagateSwipe>
      <View style={styles.modalCard}>
        <View style={styles.headerRow}>
          <CustomText
            label="screens.result.reviewModalTitle"
            fontSize={18}
            fontFamily={fonts.jakartaBold}
            color={colors.textPrimary}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.closeButton}
            onPress={onClose}>
            <CustomText
              label="x"
              fontSize={16}
              fontFamily={fonts.jakartaBold}
              color={colors.textPrimary}
              removeTranslation
            />
          </TouchableOpacity>
        </View>

        {!hasReviewData ? (
          <View style={styles.emptyState}>
            <CustomText
              label="screens.result.noReviewData"
              fontSize={14}
              fontFamily={fonts.regular}
              color={colors.textMuted}
              textAlign="center"
            />
          </View>
        ) : (
          <FlatList
            data={reviewAnswers}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator
            nestedScrollEnabled
            bounces
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </Modal>
  );
};

export default ReviewAnswersModal;

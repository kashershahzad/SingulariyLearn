import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Header from '../courseEnroll/header';
import CustomText from '../../../components/CustomText';
import Icons from '../../../components/Icons';
import fonts from '../../../assets/fonts';
import {ApiRequest} from '../../../services/ApiRequest';

const parseLocalized = (value, lang) => {
  if (!value) {
    return '';
  }
  if (typeof value === 'object') {
    return value[lang] || value.en || Object.values(value)[0] || '';
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed[lang] || parsed.en || Object.values(parsed)[0] || '';
      }
      return value;
    } catch {
      return value;
    }
  }
  return String(value);
};

const pickText = (row, keys, lang) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value === undefined || value === null || value === '') {
      continue;
    }
    const text = parseLocalized(value, lang);
    if (text) {
      return String(text);
    }
  }
  return '';
};

const pickAnswerFromOptions = (options, lang, {correct = false} = {}) => {
  if (!Array.isArray(options)) {
    return '';
  }
  const match = options.find(opt => {
    const flag =
      opt?.is_correct ?? opt?.correct ?? opt?.isCorrect ?? opt?.right;
    const isCorrect =
      flag === true || flag === 1 || flag === '1' || flag === 'true';
    return correct ? isCorrect : !isCorrect && (opt?.selected || opt?.is_selected || opt?.user_selected);
  });
  if (match) {
    return pickText(match, ['answer', 'text', 'option', 'title', 'name'], lang);
  }
  if (correct) {
    const correctOpt = options.find(opt => {
      const flag =
        opt?.is_correct ?? opt?.correct ?? opt?.isCorrect ?? opt?.right;
      return flag === true || flag === 1 || flag === '1' || flag === 'true';
    });
    return pickText(
      correctOpt,
      ['answer', 'text', 'option', 'title', 'name'],
      lang,
    );
  }
  return '';
};

const normalizeMistakes = (payload, lang) => {
  const raw = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.mistakes)
        ? payload.mistakes
        : Array.isArray(payload?.questions)
          ? payload.questions
          : Array.isArray(payload?.list)
            ? payload.list
            : [];

  return raw
    .map((row, index) => {
      const questionObj = row?.question && typeof row.question === 'object'
        ? row.question
        : row;

      const options =
        questionObj?.options ||
        questionObj?.answers ||
        row?.options ||
        row?.answers;

      const userAnswer =
        pickText(
          row,
          [
            'user_answer',
            'wrong_answer',
            'selected_answer',
            'your_answer',
            'answer_text',
            'user_answer_text',
            'selected_option',
          ],
          lang,
        ) ||
        pickAnswerFromOptions(options, lang, {correct: false}) ||
        pickText(row, ['incorrect_answer'], lang);

      const correctAnswer =
        pickText(
          row,
          [
            'correct_answer',
            'right_answer',
            'correct_option',
            'correct_answer_text',
          ],
          lang,
        ) || pickAnswerFromOptions(options, lang, {correct: true});

      const question =
        pickText(
          questionObj,
          ['question', 'question_text', 'title', 'name', 'text'],
          lang,
        ) ||
        pickText(row, ['question', 'question_text', 'title', 'name'], lang);

      const courseName =
        pickText(
          row,
          ['course_name', 'course_title', 'course'],
          lang,
        ) ||
        pickText(row?.course, ['name', 'title'], lang);

      const lessonName =
        pickText(
          row,
          ['lesson_name', 'lesson_title', 'lesson'],
          lang,
        ) ||
        pickText(row?.lesson, ['name', 'title'], lang);

      return {
        id: String(
          row?.id ??
            row?.question_id ??
            questionObj?.id ??
            `mistake-${index}`,
        ),
        courseName: courseName || 'Course',
        lessonName: lessonName || 'Lesson',
        question: question || 'Question unavailable',
        userAnswer: userAnswer || '—',
        correctAnswer: correctAnswer || '—',
      };
    })
    .filter(item => item.question);
};

const MistakeCard = ({item}) => (
  <View style={styles.card}>
    <View style={styles.metaBlock}>
      <View style={styles.metaRow}>
        <Icons
          family="Ionicons"
          name="school-outline"
          size={13}
          color="#0298EF"
        />
        <View style={styles.metaTextWrap}>
          <CustomText
            label={item.courseName}
            fontSize={11}
            fontFamily={fonts.jakartaSemiBold}
            color="#0298EF"
            lineHeight={15}
            removeTranslation
          />
        </View>
      </View>
      <View style={[styles.metaRow, styles.metaRowGap]}>
        <Icons
          family="Ionicons"
          name="book-outline"
          size={13}
          color="#777587"
        />
        <View style={styles.metaTextWrap}>
          <CustomText
            label={item.lessonName}
            fontSize={11}
            fontFamily={fonts.jakartaMedium}
            color="#777587"
            lineHeight={15}
            removeTranslation
          />
        </View>
      </View>
    </View>

    <CustomText
      label={item.question}
      fontSize={15}
      fontFamily={fonts.jakartaBold}
      color="#1B1B24"
      lineHeight={21}
      marginTop={12}
      removeTranslation
    />

    <View style={styles.answersStack}>
      <View style={[styles.answerBox, styles.wrongBox]}>
        <View style={styles.answerTop}>
          <View style={[styles.answerIcon, styles.wrongIcon]}>
            <Icons family="Ionicons" name="close" size={14} color="#FFFFFF" />
          </View>
          <CustomText
            label="Your answer"
            fontSize={11}
            fontFamily={fonts.jakartaBold}
            color="#E11D48"
            removeTranslation
          />
        </View>
        <CustomText
          label={item.userAnswer}
          fontSize={13}
          fontFamily={fonts.jakartaMedium}
          color="#9F1239"
          lineHeight={18}
          marginTop={6}
          removeTranslation
        />
      </View>

      <View style={[styles.answerBox, styles.correctBox]}>
        <View style={styles.answerTop}>
          <View style={[styles.answerIcon, styles.correctIcon]}>
            <Icons
              family="Ionicons"
              name="checkmark"
              size={14}
              color="#FFFFFF"
            />
          </View>
          <CustomText
            label="Correct answer"
            fontSize={11}
            fontFamily={fonts.jakartaBold}
            color="#16A34A"
            removeTranslation
          />
        </View>
        <CustomText
          label={item.correctAnswer}
          fontSize={13}
          fontFamily={fonts.jakartaMedium}
          color="#166534"
          lineHeight={18}
          marginTop={6}
          removeTranslation
        />
      </View>
    </View>
  </View>
);

const ReviewMistakes = () => {
  const token = useSelector(state => state.authConfig.token);
  const currentLanguage = useSelector(state => state.language.language) || 'en';
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchMistakes = useCallback(
    async ({silent = false} = {}) => {
      if (!token) {
        setMistakes([]);
        setError('Please login to review mistakes.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (!silent) {
        setLoading(true);
      }
      setError('');

      try {
        const body = {
          type: 'review_mistakes',
          user_id: String(token),
          limit: 30,
          lang_code: String(currentLanguage || 'en'),
        };
        const response = await ApiRequest(body);
        console.log('review_mistakes response', response?.data);

        if (response?.status === 200) {
          const mapped = normalizeMistakes(
            response?.data?.data ?? response?.data,
            currentLanguage,
          );
          setMistakes(mapped);
          if (!mapped.length) {
            setError('');
          }
        } else {
          setMistakes([]);
          setError(
            response?.data?.message || 'Unable to load mistakes right now.',
          );
        }
      } catch (err) {
        console.log('review_mistakes error:', err);
        setMistakes([]);
        setError('Unable to load mistakes right now.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, currentLanguage],
  );

  useFocusEffect(
    useCallback(() => {
      fetchMistakes();
    }, [fetchMistakes]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMistakes({silent: true});
  };

  return (
    <ScreenWrapper
      paddingHorizontal={0}
      statusBarColor="#F5F8FC"
      backgroundColor="#F5F8FC"
      headerUnScrollable={() => (
        <Header title="Review Mistakes" removeTranslation />
      )}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <CustomText
          label={
            loading
              ? 'Loading your mistakes...'
              : mistakes.length
                ? `${mistakes.length} mistakes to review`
                : 'Review your mistakes'
          }
          fontSize={16}
          fontFamily={fonts.jakartaBold}
          color="#1B1B24"
          marginBottom={12}
          removeTranslation
        />

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#0298EF" />
          </View>
        ) : mistakes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Icons
              family="Ionicons"
              name="checkmark-circle-outline"
              size={36}
              color="#16A34A"
            />
            <CustomText
              label={error || 'No mistakes yet. Keep practicing!'}
              fontSize={14}
              fontFamily={fonts.jakartaMedium}
              color="#777587"
              marginTop={10}
              textAlign="center"
              lineHeight={20}
              removeTranslation
            />
          </View>
        ) : (
          mistakes.map(item => <MistakeCard key={item.id} item={item} />)
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default ReviewMistakes;

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    flexGrow: 1,
  },
  centerState: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EEF5',
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EEF5',
    padding: 14,
    marginBottom: 12,
  },
  metaBlock: {
    gap: 4,
    width: '100%',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    width: '100%',
  },
  metaTextWrap: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  metaRowGap: {
    marginTop: 2,
  },
  answersStack: {
    marginTop: 12,
    gap: 8,
  },
  answerBox: {
    borderRadius: 12,
    padding: 12,
  },
  wrongBox: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  correctBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  answerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  answerIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrongIcon: {
    backgroundColor: '#E11D48',
  },
  correctIcon: {
    backgroundColor: '#16A34A',
  },
});

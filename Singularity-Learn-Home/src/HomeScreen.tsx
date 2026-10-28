import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { HomeScreenProps } from './types';
import { styles as s } from './styles';
import { colors } from './theme';
import { ActionButton } from './components/ActionButton';
import { CourseCard } from './components/CourseCard';
import { ProgressBar } from './components/ProgressBar';

export default function HomeScreen({ learner, courses, onAction, savedCourseIds, onToggleSaved,
  loading = false, error, onRefresh, refreshing = false, showBottomNavigation = true }: HomeScreenProps) {
  const [query, setQuery] = useState('');
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const columns = fontScale > 1.3 ? 1 : width >= 1000 ? 3 : width >= 650 ? 2 : 1;
  const contentWidth = Math.min(width - insets.left - insets.right, 1120) - 40;
  const cardWidth = Math.max(0, (contentWidth - 16 * (columns - 1)) / columns);
  const results = useMemo(() => courses.filter(course =>
    `${course.title} ${course.category} ${course.description}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [courses, query]);
  const enrolled = learner.kind === 'enrolled' ? learner.enrollments.flatMap(enrollment => {
    const course = courses.find(item => item.id === enrollment.courseId);
    return course ? [{ course, enrollment }] : [];
  }) : [];
  const firstName = learner.kind === 'guest' ? '' : learner.firstName.trim();
  return <SafeAreaView style={s.safe} edges={['top', 'left', 'right', 'bottom']}>
    <View style={s.screen}>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}>
        <View style={s.header}><View style={s.headerInner}>
          <View style={s.between}>
            <View><Image source={require('../assets/logo-white.png')} style={s.logo} resizeMode="contain" accessibilityLabel="Singularity Technologies LLC" /><Text style={s.brand}>Singularity Learn</Text></View>
            <ActionButton secondary label="Notifications" onPress={() => onAction({ type: 'notifications' })} />
          </View>
          <TextInput value={query} onChangeText={setQuery} style={s.search} placeholder="Search courses"
            placeholderTextColor={colors.muted} accessibilityLabel="Search courses" returnKeyType="search" autoCorrect={false} clearButtonMode="while-editing" />
        </View></View>
        <View style={s.content}>
          <View style={s.stack}>
            <Text accessibilityRole="header" style={s.title}>{learner.kind === 'guest' ? 'Guidance. Test prep.\nServices in your language.' : `Welcome back${firstName ? `, ${firstName}` : ''}.`}</Text>
            <Text style={s.body}>{learner.kind === 'guest' ? 'Build your skills and take the next step with Singularity Learn.' : enrolled.length ? 'A little progress today brings your goal closer.' : 'Find a course that fits your next goal.'}</Text>
            {learner.kind === 'guest' && <View style={s.row}>
              <ActionButton label="Create an account" onPress={() => onAction({ type: 'signUp' })} />
              <ActionButton secondary label="Sign in" onPress={() => onAction({ type: 'signIn' })} />
            </View>}
          </View>
          {!loading && !error && learner.kind === 'enrolled' && <View style={s.stack}>
            <Text accessibilityRole="header" style={s.heading}>Continue learning</Text>
            {enrolled.length === 0 ? <Text style={s.body}>Your enrolled courses will appear here when available.</Text> : enrolled.map(({ course, enrollment }) => {
              const completed = Math.max(0, Math.min(course.lessons, enrollment.completedLessons));
              const percent = course.lessons > 0 ? completed / course.lessons * 100 : 0;
              return <View key={course.id} style={s.card}>
                <Text style={s.cardTitle}>{course.title}</Text>
                <Text style={s.muted}>{completed} of {course.lessons} lessons complete</Text>
                <ProgressBar value={percent} />
                <Text style={s.body}>{percent >= 100 ? 'Course complete. Review what you learned.' : `Next: ${enrollment.nextLesson}`}</Text>
                <ActionButton label={percent >= 100 ? 'Review course' : 'Continue learning'} onPress={() => onAction({ type: 'resume', courseId: course.id })} />
              </View>;
            })}
          </View>}
          {!query.trim() && <View style={s.hero}>
            <Text style={[s.muted, s.purple]}>LEARN FOR EVERYDAY LIFE</Text>
            <Text accessibilityRole="header" style={[s.heading, s.purple]}>Spoken English</Text>
            <Text style={s.body}>Practice conversations you can use in the real world.</Text>
            <ActionButton label="Explore courses" onPress={() => onAction({ type: 'allCourses' })} />
          </View>}
          <View style={s.stack}>
            <View style={s.between}><Text accessibilityRole="header" style={s.heading}>{query.trim() ? 'Search results' : 'Courses'}</Text>
              <ActionButton secondary label="View all" onPress={() => onAction({ type: 'allCourses' })} /></View>
            {loading ? <ActivityIndicator size="large" color={colors.blueDark} accessibilityLabel="Loading courses" /> : error ?
              <View style={s.card}><Text accessibilityRole="alert" style={s.body}>{error}</Text>{onRefresh && <ActionButton label="Try again" onPress={onRefresh} />}</View> :
              results.length === 0 ? <View style={s.card}><Text style={s.body}>{query.trim() ? 'No matching courses. Try a different search.' : 'New courses are on the way.'}</Text>{!!query && <ActionButton secondary label="Clear search" onPress={() => setQuery('')} />}</View> :
              <View style={s.grid}>{results.map(course => <View key={course.id} style={{ width: cardWidth }}><CourseCard course={course}
                saved={savedCourseIds.includes(course.id)} onSave={() => onToggleSaved(course.id)} onOpen={() => onAction({ type: 'course', courseId: course.id })} /></View>)}</View>}
          </View>
          <View style={s.card}><Text style={s.cardTitle}>Need a hand?</Text><Text style={s.body}>Get help choosing a course or using the app.</Text><ActionButton secondary label="Help center" onPress={() => onAction({ type: 'help' })} /></View>
          <Text style={s.footer}>Singularity Technologies LLC</Text>
        </View>
      </ScrollView>
      {showBottomNavigation && <View style={s.nav}>
        <View style={s.navItem}><ActionButton label="Home" selected onPress={() => setQuery('')} /></View>
        <View style={s.navItem}><ActionButton secondary label="My learning" onPress={() => onAction({ type: learner.kind === 'guest' ? 'signIn' : 'myLearning' })} /></View>
        <View style={s.navItem}><ActionButton secondary label={learner.kind === 'guest' ? 'Sign in' : 'Profile'} onPress={() => onAction({ type: learner.kind === 'guest' ? 'signIn' : 'profile' })} /></View>
      </View>}
    </View>
  </SafeAreaView>;
}

import type { ImageSourcePropType } from 'react-native';

export type Course = {
  id: string;
  title: string;
  category: string;
  description: string;
  lessons: number;
  duration: string;
  image?: ImageSourcePropType;
};
export type Enrollment = { courseId: string; completedLessons: number; nextLesson: string };
export type Learner =
  | { kind: 'guest' }
  | { kind: 'registered'; firstName: string }
  | { kind: 'enrolled'; firstName: string; enrollments: Enrollment[] };
export type HomeAction =
  | { type: 'signIn' | 'signUp' | 'notifications' | 'help' | 'allCourses' | 'profile' | 'myLearning' }
  | { type: 'course'; courseId: string }
  | { type: 'resume'; courseId: string };
export type HomeScreenProps = {
  learner: Learner;
  courses: Course[];
  onAction: (action: HomeAction) => void;
  savedCourseIds: string[];
  onToggleSaved: (courseId: string) => void;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Disable when the host app already supplies its own tab bar. */
  showBottomNavigation?: boolean;
};

import type { Course, Learner } from '../types';
/** Demonstration content only; connect approved catalog data before release. */
export const mockCourses: Course[] = [
  { id: 'adult-permit', title: 'Adult Permit DMV', category: 'Driving', lessons: 7, duration: '6 hr 30 min', description: 'Build confidence with road rules and practice questions.' },
  { id: 'cdl', title: 'Commercial Driver License', category: 'Driving', lessons: 12, duration: '8 hr', description: 'Prepare with general knowledge, combination vehicles, and air brakes.', image: require('../../assets/cdl-banner.jpg') },
  { id: 'spoken-english', title: 'Spoken English', category: 'Language', lessons: 8, duration: '4 hr', description: 'Practice English for everyday conversations and real situations.' },
];
export const mockLearners: Record<'guest' | 'registered' | 'enrolled', Learner> = {
  guest: { kind: 'guest' },
  registered: { kind: 'registered', firstName: 'Alex' },
  enrolled: { kind: 'enrolled', firstName: 'Alex', enrollments: [
    { courseId: 'cdl', completedLessons: 4, nextLesson: 'Air brake fundamentals' },
  ] },
};

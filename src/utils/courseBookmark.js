import {ApiRequest} from '../services/ApiRequest';

export const getBookmarksRowsFromResponse = response => {
  const body = response?.data;

  if (Array.isArray(body?.data)) {
    return body.data;
  }

  if (Array.isArray(body)) {
    return body;
  }

  return [];
};

export const fetchBookmarksApi = async ({
  token,
  bookmarkType,
  courseId,
  limit = '100',
}) => {
  const body = {
    type: 'get_bookmarks',
    user_id: String(token),
    limit: String(limit),
  };

  if (bookmarkType) {
    body.bookmark_type = bookmarkType;
  }

  if (courseId) {
    body.course_id = String(courseId);
  }

  return ApiRequest(body);
};

export const getBookmarkItemType = item => {
  const explicit = String(item?.bookmark_type || item?.type || '').toLowerCase();

  if (explicit) {
    return explicit;
  }

  if (item?.question_id) {
    return 'question';
  }

  if (item?.lesson_id) {
    return 'lesson';
  }

  return 'course';
};

export const isBookmarkedFlag = value =>
  value === true || value === 1 || value === '1';

export const toggleCourseBookmarkApi = async ({
  token,
  courseId,
  isBookmarked,
}) => {
  const body = isBookmarked
    ? {
        type: 'delete_data',
        table_name: 'course_bookmarks',
        user_id: String(token),
        course_id: String(courseId),
      }
    : {
        type: 'add_data',
        table_name: 'course_bookmarks',
        user_id: String(token),
        course_id: String(courseId),
      };

  return ApiRequest(body);
};

export const toggleLessonBookmarkApi = async ({
  token,
  courseId,
  lessonId,
  isBookmarked,
}) => {
  const body = isBookmarked
    ? {
        type: 'unbookmark',
        user_id: String(token),
        bookmark_type: 'lesson',
        lesson_id: String(lessonId),
      }
    : {
        type: 'bookmark',
        user_id: String(token),
        bookmark_type: 'lesson',
        lesson_id: String(lessonId),
        course_id: String(courseId),
      };

  return ApiRequest(body);
};

export const toggleQuestionBookmarkApi = async ({
  token,
  courseId,
  questionId,
  isBookmarked,
}) => {
  const body = isBookmarked
    ? {
        type: 'unbookmark',
        user_id: String(token),
        bookmark_type: 'question',
        question_id: String(questionId),
      }
    : {
        type: 'bookmark',
        user_id: String(token),
        bookmark_type: 'question',
        course_id: String(courseId),
        question_id: String(questionId),
      };

  return ApiRequest(body);
};

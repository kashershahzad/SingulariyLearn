import AsyncStorage from '@react-native-async-storage/async-storage';
import {ApiRequest} from '../services/ApiRequest';

const GUEST_USER_KEY = 'guest_user_id';

const makeId = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

/**
 * Creates or returns a guest account without collecting personal info.
 * Used by "Continue as Guest" on the login screen (Apple 5.1.1(v)).
 */
export const getOrCreateGuestUserId = async () => {
  const existing = await AsyncStorage.getItem(GUEST_USER_KEY);
  if (existing && !String(existing).startsWith('local_')) {
    return existing;
  }

  const uuid = makeId().replace(/-/g, '');
  const email = `guest_${uuid}@singularity.guest`;
  const password = `G${uuid.slice(0, 16)}a1!`;

  const response = await ApiRequest({
    type: 'register',
    reg_type: 'email',
    first_name: 'Guest',
    last_name: 'User',
    email,
    phone: '',
    password,
    language_id: '1',
    exam_country: '1',
    goal_id: '1',
  });

  const userId = response?.data?.user_id;
  if (!userId) {
    throw new Error(
      response?.data?.message || 'Unable to continue as guest. Please try again.',
    );
  }

  const id = String(userId);
  await AsyncStorage.setItem(GUEST_USER_KEY, id);
  return id;
};

import {useEffect} from 'react';
import {BackHandler, Platform} from 'react-native';
import {CommonActions, StackActions} from '@react-navigation/native';

import {navigationRef} from './navigationRef';

/**
 * Walk focused branch and find the deepest stack/tab that can go back.
 * Avoids root-level goBack() which can finish the Android activity.
 */
function findPopTarget(state, parentKey = null) {
  if (!state || !Array.isArray(state.routes) || state.routes.length === 0) {
    return null;
  }

  const index = typeof state.index === 'number' ? state.index : 0;
  const route = state.routes[index];
  const child = route?.state;

  if (child) {
    const nested = findPopTarget(child, state.key || parentKey);
    if (nested) {
      return nested;
    }
  }

  // Stack / native-stack with history
  if (
    (state.type === 'stack' || !state.type) &&
    typeof state.index === 'number' &&
    state.index > 0 &&
    state.key
  ) {
    return {key: state.key, kind: 'stack'};
  }

  // Tabs: not on first tab — switch toward home instead of exiting
  if (
    state.type === 'tab' &&
    typeof state.index === 'number' &&
    state.index > 0 &&
    state.key
  ) {
    return {key: state.key, kind: 'tab', state};
  }

  return null;
}

function getFocusedLeafName(state) {
  let current = state;
  while (current?.routes?.length) {
    const index = typeof current.index === 'number' ? current.index : 0;
    const route = current.routes[index];
    if (!route?.state) {
      return route?.name || null;
    }
    current = route.state;
  }
  return null;
}

function isOnHomeTab(state) {
  let current = state;
  while (current?.routes?.length) {
    const index = typeof current.index === 'number' ? current.index : 0;
    const route = current.routes[index];
    if (current.type === 'tab') {
      return route?.name === 'LandingPage';
    }
    if (!route?.state) {
      return route?.name === 'LandingPage' || route?.name === 'TabStack';
    }
    current = route.state;
  }
  return false;
}

function handleBackNavigation() {
  if (!navigationRef.isReady()) {
    // Not ready — consume event so Android does not finish the activity
    return true;
  }

  const rootState = navigationRef.getRootState();
  const target = findPopTarget(rootState);

  if (target?.kind === 'stack' && target.key) {
    navigationRef.dispatch({
      ...StackActions.pop(),
      target: target.key,
    });
    return true;
  }

  if (target?.kind === 'tab') {
    // Prefer Home tab over exiting the app
    navigationRef.navigate('TabStack', {screen: 'LandingPage'});
    return true;
  }

  // Already at root home — stay in app (do not finish activity)
  if (isOnHomeTab(rootState)) {
    return true;
  }

  // Fallback: reset to TabStack home instead of exiting
  const leaf = getFocusedLeafName(rootState);
  if (leaf && leaf !== 'LandingPage') {
    try {
      navigationRef.dispatch(
        CommonActions.navigate({
          name: 'TabStack',
          params: {screen: 'LandingPage'},
        }),
      );
      return true;
    } catch {
      // fall through
    }
  }

  // Consume back so Android 14/15 does not close the app unexpectedly
  return true;
}

export function useAndroidBackHandler() {
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackNavigation,
    );

    return () => subscription.remove();
  }, []);
}

/**
 * Safe back for header / UI buttons — never pops the root stack off.
 */
export function safeGoBack(navigation) {
  if (!navigation) {
    return;
  }

  try {
    const state = navigation.getState?.();
    if (
      state &&
      typeof state.index === 'number' &&
      state.index > 0
    ) {
      navigation.goBack();
      return;
    }

    const parent = navigation.getParent?.();
    const parentState = parent?.getState?.();
    if (
      parentState &&
      typeof parentState.index === 'number' &&
      parentState.index > 0
    ) {
      parent.goBack();
      return;
    }

    if (navigationRef.isReady()) {
      const rootState = navigationRef.getRootState();
      const target = findPopTarget(rootState);
      if (target?.kind === 'stack' && target.key) {
        navigationRef.dispatch({
          ...StackActions.pop(),
          target: target.key,
        });
        return;
      }
    }

    // Fallback to home tab
    if (navigationRef.isReady()) {
      navigationRef.navigate('TabStack', {screen: 'LandingPage'});
      return;
    }

    navigation.navigate?.('LandingPage');
  } catch (e) {
    if (__DEV__) {
      console.warn('safeGoBack failed', e);
    }
    try {
      navigation.navigate?.('LandingPage');
    } catch {
      // ignore
    }
  }
}

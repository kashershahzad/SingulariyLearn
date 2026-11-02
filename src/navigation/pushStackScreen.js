/**
 * Push onto the nearest parent stack navigator so hardware back can pop.
 * Tab screens calling navigate() alone may not always leave a back stack on Android.
 */
export function pushStackScreen(navigation, name, params) {
  let nav = navigation;
  while (nav) {
    if (typeof nav.push === 'function') {
      nav.push(name, params);
      return;
    }
    nav = nav.getParent?.() ?? null;
  }
  navigation.navigate(name, params);
}

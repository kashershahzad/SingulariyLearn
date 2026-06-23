import {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import {getThemeColors} from './themes';
import {setDarkMode, toggleDarkMode} from '../store/reducer/themeSlice';

export const useTheme = () => {
  const isDarkMode = useSelector(state => state.theme?.isDarkMode ?? false);
  const dispatch = useDispatch();
  const colors = useMemo(() => getThemeColors(isDarkMode), [isDarkMode]);

  return {
    isDarkMode,
    colors,
    setDarkMode: value => dispatch(setDarkMode(value)),
    toggleDarkMode: () => dispatch(toggleDarkMode()),
  };
};

export const useThemedStyles = styleFactory => {
  const {colors, isDarkMode} = useTheme();
  return useMemo(
    () => StyleSheet.create(styleFactory(colors)),
    [colors, isDarkMode],
  );
};

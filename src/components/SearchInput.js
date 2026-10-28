import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';

import CustomText from './CustomText';
import Icons from './Icons';

import i18n from '../language/i18n';
import {useTheme, useThemedStyles} from '../theme/useTheme';
import fonts from '../assets/fonts';
import ImageFast from './ImageFast';
import { Images } from '../assets/images';

const SearchInput = ({
  placeholder,
  value,
  onChangeText,
  maxLength,
  marginBottom,
  isFocus,
  isBlur,
  autoFocus,
  ref,
  marginTop,
  isBack,
  onPress,
  editable = true,
  isDropdown,
  select,
  setSelect,
  /** 'left' (default) | 'right' — search icon placement */
  iconPosition = 'left',
}) => {
  const {colors} = useTheme();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
      mainContainer: {
        backgroundColor: c.card,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        borderWidth: 1,
        height: 40,
        width: '100%',
        borderRadius: 10,
      },
      input: {
        flex: 1,
        height: '100%',
        padding: 0,
        margin: 0,
        fontFamily: fonts.medium,
        fontSize: 13,
        color: c.textPrimary,
      },
      searchIcon: {
        width: 24,
        height: 24,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
      },
      searchIconLeft: {
        marginRight: 10,
      },
      searchIconRight: {
        marginLeft: 10,
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      list: {
        backgroundColor: c.card,
        elevation: 2,
        padding: 10,
        borderRadius: 5,
        position: 'absolute',
        right: 10,
        bottom: -20,
      },
      icon: {
        height: 20,
        width: 20,
      },
    }),
  );
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const navigation = useNavigation();
  const handleFocus = () => {
    setIsFocused(true);
    isFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    isBlur?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      style={[
        styles.mainContainer,
        {
          marginBottom,
          marginTop,
          borderColor: isFocused ? colors.accent : colors.border,
        },
      ]}>
      {isBack ? (
        <Icons
          family="Ionicons"
          name="arrow-back-outline"
          color={colors.textPrimary}
          size={25}
          style={{ marginRight: 10 }}
          onPress={() => navigation.goBack()}
        />
      ) : null}
      {iconPosition === 'left' ? (
        <TouchableOpacity
          style={[styles.searchIcon, styles.searchIconLeft]}
          activeOpacity={0.6}
          onPress={onPress}>
          <Icons family="Feather" name="search" color={colors.textMuted} size={22} />
        </TouchableOpacity>
      ) : null}
      {editable ? (
        <TextInput
          ref={ref}
          placeholder={i18n.t(placeholder)}
          style={styles.input}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          onChangeText={onChangeText}
          maxLength={maxLength}
          placeholderTextColor={colors.textMuted}
          autoFocus={autoFocus}
          editable={editable}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <CustomText
            label={placeholder}
            color={colors.textMuted}
            fontSize={15}
            fontFamily={fonts.medium}
          />
        </View>
      )}
      {iconPosition === 'right' ? (
        <TouchableOpacity
          style={[styles.searchIcon, styles.searchIconRight]}
          activeOpacity={0.6}
          onPress={onPress}>
          {/* <Icons family="Feather" name="search" color={'#BDBDBD'} size={22} /> */}
          <ImageFast
            source={Images.searchicon}
            resizeMode={'contain'}
            style={{height: 22, width: 22}}
          />
        </TouchableOpacity>
      ) : null}

      {isDropdown ? (
        <>
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.6}
            onPress={() => setOpen(!isOpen)}>
            <CustomText
              label={select}
              fontSize={10}
              fontFamily={fonts.bold}
              textTransform="uppercase"
              marginRight={2}
            />
            {/* <Icons
              family="Entypo"
              name={isOpen ? 'chevron-up' : 'chevron-down'}
              size={12}
              color={COLORS.black}
            /> */}
            <ImageFast
              source={Images.filter}
              resizeMode={'contain'}
              style={styles.icon}
            />
          </TouchableOpacity>
          {/* {isOpen ? (
            <TouchableOpacity activeOpacity={1} style={styles.list}>
              {['schedule', 'now'].map((item, i) => (
                <CustomText
                  key={item}
                  label={item}
                  fontSize={12}
                  fontFamily={fonts.semiBold}
                  textTransform="uppercase"
                  marginBottom={i == 0 ? 7 : 0}
                  onPress={() => {
                    setSelect(item);
                    setOpen(false);
                  }}
                />
              ))}
            </TouchableOpacity>
          ) : null} */}
        </>
      ) : null}
    </TouchableOpacity>
  );
};

export default SearchInput;

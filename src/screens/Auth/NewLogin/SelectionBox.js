import {StyleSheet, View, TouchableOpacity} from 'react-native';
import React from 'react';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import ImageFast from '../../../components/ImageFast';

const BLUE = '#007AFF';

/**
 * @param {boolean} [goals] — When true, shows left icon and tag pills below subtitle.
 * @param {import('react-native').ImageSourcePropType} [iconSource] — Local image for left icon.
 * @param {string} [iconUri] — Remote image URL for left icon.
 * @param {{ text: string, tone?: 'accent' | 'muted' }[]} [tags] — Tag pills shown when goals is true.
 */
const SelectionBox = ({
  title,
  subtitle,
  selected,
  onPress,
  goals,
  iconSource,
  iconUri,
  tags,
}) => {
  const showGoals = Boolean(goals);
  const icon = iconSource || (iconUri ? {uri: iconUri} : null);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={[
        styles.card,
        showGoals && styles.cardGoals,
        selected && styles.cardSelected,
        goals ? {borderRadius:20} : {borderRadius:8},
      ]}>
      {showGoals && icon ? (
        <View style={styles.iconWrap}>
          <ImageFast
            source={icon}
            resizeMode="contain"
            style={styles.iconImg}
          />
        </View>
      ) : null}
      <View style={styles.cardText}>
        <CustomText
          label={title}
          fontSize={16}
          fontFamily={fonts.semiBold}
          color={'#000000'}
        />
        <CustomText
          label={subtitle}
          fontSize={12}
          fontFamily={fonts.regular}
          color={'#999999'}
          marginTop={4}
          lineHeight={18}
        />
        {showGoals && tags?.length ? (
          <View style={styles.tagsRow}>
            {tags.map((tag, index) => {
              const tone =
                typeof tag === 'string'
                  ? 'muted'
                  : tag.tone || 'muted';
              const text =
                typeof tag === 'string' ? tag : tag.text;
              return (
                <View
                  key={`${text}-${index}`}
                  style={[
                    styles.tagPill,
                    tone === 'accent' && styles.tagPillAccent,
                  ]}>
                  <CustomText
                    label={text}
                    fontSize={12}
                    fontFamily={fonts.medium}
                    color={tone === 'accent' ? '#0298EF' : '#000000'}
                  />
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
      <View
        style={[
          styles.radioOuter,
          showGoals && styles.radioAlignCenter,
          selected && styles.radioOuterSelected,
          showGoals && selected && styles.radioGoalSelected,
        ]}>
        {selected ? (
          <View
            style={showGoals ? styles.radioGoalInner : styles.radioInner}
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default SelectionBox;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  cardGoals: {
    alignItems: 'flex-start',
  },
  cardSelected: {
    borderColor: BLUE,
    borderWidth: 1.5,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#E3F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconImg: {
    width: 28,
    height: 28,
  },
  cardText: {
    flex: 1,
    paddingRight: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#EFEFEF',
  },
  tagPillAccent: {
    backgroundColor: '#A9DFFF',
  },
  radioAlignCenter: {
    alignSelf: 'center',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#C8C8C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: BLUE,
  },
  radioGoalSelected: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BLUE,
  },
  radioGoalInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});

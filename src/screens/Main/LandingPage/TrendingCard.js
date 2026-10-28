import {
  Dimensions,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import ImageFast from '../../../components/ImageFast';
import {Images} from '../../../assets/images';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import {useNavigation} from '@react-navigation/native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_SIDE_PAD = 20;
const GRID_GAP = 10;
const COMPACT_CARD_WIDTH =
  (SCREEN_WIDTH - GRID_SIDE_PAD * 2 - GRID_GAP) / 2;

const TrendingCard = ({
  courseId,
  cover,
  title = '',
  price = '',
  priceRaw,
  subtitle = '',
  lessonCount = 0,
  questionCount = 0,
  tag = '',
  appleProductId = '',
  googleProductId = '',
  isPurchased = false,
  isLoggedIn = false,
  compact = false,
}) => {
  const navigation = useNavigation();

  const courseParams = {
    courseId,
    course_id: courseId,
    title,
    subtitle,
    price: priceRaw ?? price,
    cover,
    tag,
    lessonCount,
    apple_product_id: appleProductId,
    google_product_id: googleProductId,
  };

  const handleCardPress = () => {
    navigation.navigate('CourseEnroll', courseParams);
  };

  const handleActionPress = () => {
    if (isPurchased || isLoggedIn) {
      handleCardPress();
      return;
    }

    navigation.navigate('NewLogin');
  };

  const countValue = Number(questionCount) || Number(lessonCount) || 0;
  const countLabel = Number(questionCount)
    ? `${countValue} Questions`
    : countValue
      ? `${countValue} Lessons`
      : '';
  const metaLabel = [countLabel, 'Audio Support'].filter(Boolean).join(' • ');

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleCardPress}
      style={[styles.wrapper, compact && styles.wrapperCompact]}>
      <View style={[styles.container, compact && styles.containerCompact]}>
        <View style={[styles.imageClip, compact && styles.imageClipCompact]}>
          <ImageFast
            source={cover ? {uri: String(cover)} : Images.trendingpicture}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <View style={styles.body}>
          <View style={styles.titleBlock}>
            <CustomText
              label={title}
              fontFamily={fonts.jakartaBold}
              fontSize={compact ? 12 : 15}
              color="#1B1B24"
              lineHeight={compact ? 16 : 20}
              numberOfLines={2}
              removeTranslation
            />
          </View>

          <CustomText
            label={metaLabel || ' '}
            fontFamily={fonts.jakartaRegular}
            fontSize={compact ? 10 : 12}
            color="#8E94A3"
            marginTop={4}
            numberOfLines={1}
            removeTranslation
          />

          <View style={styles.footer}>
            <CustomText
              label={price || '$0.00'}
              fontFamily={fonts.jakartaBold}
              fontSize={compact ? 13 : 16}
              color="#1B1B24"
              numberOfLines={1}
              removeTranslation
            />
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleActionPress}
              style={[
                styles.actionBtn,
                isPurchased ? styles.purchasedBtn : styles.viewBtn,
              ]}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <CustomText
                label={
                  isPurchased
                    ? 'screens.landing.purchased'
                    : 'screens.landing.viewCourse'
                }
                fontFamily={fonts.jakartaSemiBold}
                fontSize={10}
                color={isPurchased ? '#0298EF' : '#FFFFFF'}
                numberOfLines={1}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TrendingCard;

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
    marginRight: 20,
  },
  wrapperCompact: {
    width: COMPACT_CARD_WIDTH,
    marginRight: 0,
    marginVertical: 0,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EEF5',
    overflow: 'hidden',
  },
  containerCompact: {
    flex: 1,
  },
  imageClip: {
    width: '100%',
    height: 120,
    backgroundColor: '#E8EEF5',
  },
  imageClipCompact: {
    height: 100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  body: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
  },
  titleBlock: {
    minHeight: 32,
    justifyContent: 'flex-start',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  actionBtn: {
    height: 30,
    borderRadius: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  viewBtn: {
    backgroundColor: '#0298EF',
  },
  purchasedBtn: {
    borderWidth: 1,
    borderColor: '#0298EF',
    backgroundColor: '#EAF8FF',
  },
});

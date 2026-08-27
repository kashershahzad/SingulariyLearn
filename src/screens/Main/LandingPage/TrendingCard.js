import {StyleSheet, View, TouchableOpacity} from 'react-native';
import React from 'react';
import ImageFast from '../../../components/ImageFast';
import {Images} from '../../../assets/images';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import {useNavigation} from '@react-navigation/native';

const TrendingCard = ({
  courseId,
  cover,
  category = '',
  title = '',
  ratingValue,
  reviewsLabel,
  price = '',
  priceRaw,
  subtitle = '',
  lessonCount = 0,
  tag = '',
  appleProductId = '',
  googleProductId = '',
  isPurchased = false,
  isLoggedIn = false,
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

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handleCardPress}>
      <View style={styles.container}>
        <View style={styles.imageClip}>
          <ImageFast
            source={cover ? {uri: String(cover)} : Images.trendingpicture}
            style={styles.image}
            resizeMode="cover"
          />
          {!!tag && (
            <View style={styles.tagBadge} pointerEvents="box-none">
              <CustomText
                label={tag}
                fontFamily={fonts.jakartaBold}
                fontSize={12}
                color="#0298EF"
                removeTranslation
              />
            </View>
          )}
        </View>

        {!!category && (
          <CustomText
            label={category}
            fontFamily={fonts.jakartaSemiBold}
            fontSize={16}
            color="#777587"
            marginTop={5}
            removeTranslation
          />
        )}

        <CustomText
          label={title}
          fontFamily={fonts.jakartaBold}
          fontSize={18}
          color="#1B1B24"
          removeTranslation
        />

        {!!ratingValue && (
          <View style={styles.ratingContainer}>
            <ImageFast
              source={Images.ratingstar}
              style={styles.rating}
              resizeMode="contain"
            />
            <CustomText
              label={ratingValue}
              fontFamily={fonts.jakartaBold}
              fontSize={16}
              color="#1B1B24"
              removeTranslation
            />
            {!!reviewsLabel && (
              <CustomText
                label={reviewsLabel}
                fontFamily={fonts.jakartaRegular}
                fontSize={12}
                color="#777587"
                removeTranslation
              />
            )}
          </View>
        )}

        <View style={styles.priceContainer}>
          <CustomText
            label={price}
            fontFamily={fonts.jakartaBold}
            fontSize={20}
            color="#1B1B24"
            removeTranslation
          />
          {isPurchased ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleActionPress}
              style={styles.purchasedBtn}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <CustomText
                label="screens.landing.purchased"
                fontFamily={fonts.jakartaSemiBold}
                fontSize={13}
                color="#0298EF"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleActionPress}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <ImageFast
                source={Images.cart}
                style={styles.cart}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TrendingCard;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    marginRight: 20,
  },
  imageClip: {
    width: '100%',
    height: 205,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E8EEF5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  tagBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: '#ADE1FF',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  rating: {
    width: 13,
    height: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  cart: {
    width: 40,
    height: 40,
  },
  purchasedBtn: {
    borderWidth: 1,
    borderColor: '#0298EF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#EAF8FF',
  },
});

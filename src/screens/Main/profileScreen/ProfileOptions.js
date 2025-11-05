import { StyleSheet, View } from 'react-native';
import React from 'react';
import ImageFast from '../../../components/ImageFast';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const ProfileOptions = () => {
  const { t, i18n } = useTranslation();
  const userData = useSelector(state => state.users.userData);

  // If user has no purchase, show nothing
  const permit = userData?.purchase?.permit;
  if (!permit) {
    return null;
  }

  // Parse multilingual name (since it’s stored as JSON)
  let permitName = '';
  try {
    const nameObj = JSON.parse(permit?.name || '{}');
    permitName = nameObj[i18n.language] || nameObj['en'] || '';
  } catch (error) {
    permitName = permit?.name || '';
  }

  const dynamicOptions = [
    {
      title: permitName,
      image: permit?.image,
    },
  ];

  return (
    <>
      {dynamicOptions.map((item, i) => (
        <View key={i} style={styles.container}>
          <ImageFast
            source={{ uri: item.image }}
            resizeMode="contain"
            style={styles.icon}
          />
          <CustomText
            fontSize={14}
            marginTop={30}
            fontFamily={fonts.medium}
            label={item.title}
          />
        </View>
      ))}
    </>
  );
};

export default ProfileOptions;

const styles = StyleSheet.create({
  container: {
    height: 127,
    width: '33%',
    borderRadius: 10,
    borderColor: '#E5E5E5',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    height: 30,
    width: 30,
  },
});

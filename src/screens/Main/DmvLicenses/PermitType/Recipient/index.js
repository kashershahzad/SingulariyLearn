import { Alert, StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenWrapper from '../../../../../components/ScreenWrapper';
import ImageFast from '../../../../../components/ImageFast';
import Header2 from '../../Molecules/Header2';
import RecipientCard from './RecipientCard';
import CustomButton from '../../../../../components/CustomButton';
import { COLORS } from '../../../../../utils/COLORS';
import fonts from '../../../../../assets/fonts';
import { Images } from '../../../../../assets/images';
import { ApiRequest } from '../../../../../services/ApiRequest';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const Recipient = ({ navigation, route }) => {
  const { id } = route.params;
  const currentLanguage = useSelector(state => state.language.language);
  const userData = useSelector(state => state.users.userData);
  const [successmsg, setsuccessmsg] = useState(true);
  const [data, setdata] = useState();
  const { t } = useTranslation();

  useEffect(() => {
    setTimeout(() => {
      setsuccessmsg(false);
    }, 4000);
  }, []);

  useEffect(() => {
    const Getinfo = async () => {
      try {
        const body = {
          type: 'get_data',
          table_name: 'purchases',
          id: id,
        };
        const response = await ApiRequest(body);
        const item = response.data.data[0];

        const parsedData = {
          id: item.id,
          amount: item.amount,
          time: item.updated_at.split(' ')[0],
          permitName: JSON.parse(item.permit.name)[currentLanguage],
          packageName: JSON.parse(item.package.title)[currentLanguage],
          duration: JSON.parse(item.package.duration)[currentLanguage],
          vehicle: JSON.parse(item.package.vehicle)[currentLanguage],
        };
        setdata(parsedData);
      } catch (error) {
        Alert.alert(t('recipient.errorMessage'));
        console.log('error', error);
      }
    };
    Getinfo();
  }, [id]);

  const info = [
    { title: t('recipient.id'), info: data?.id },
    { title: t('recipient.name'), info: userData?.name },
    { title: t('recipient.package'), info: data?.packageName },
    { title: t('recipient.vehicles'), info: data?.vehicle },
    { title: t('recipient.duration'), info: data?.duration },
    { title: t('recipient.issue'), info: data?.time },
    // { title: t('recipient.expiry'), info: '08-23-2025' },
  ];

  return (
    <>
      {successmsg === true ? (
        <ScreenWrapper
          backgroundColor="white"
          statusBarColor="white"
          paddingBottom={20}
          scrollEnabled={!successmsg}>
          <View style={styles.container}>
            <ImageFast
              source={Images.sucess}
              resizeMode={'contain'}
              style={styles.icon}
            />
          </View>
        </ScreenWrapper>
      ) : (
        <ScreenWrapper
          backgroundColor="white"
          statusBarColor="white"
          paddingBottom={20}
          scrollEnabled={!successmsg}
          headerUnScrollable={() => (
            <Header2 line={true} title={t('recipient.recipientTitle')} />
          )}>
          <RecipientCard info={info} title={data?.permitName} />
          <CustomButton
            onPress={() => navigation.navigate('TabStack')}
            title={t('recipient.close')}
            marginTop={53}
            height={62}
            borderRadius={10}
            backgroundColor={COLORS.btn}
            fontSize={20}
            fontFamily={fonts.jakartaSemiBold}
          />
        </ScreenWrapper>
      )}
    </>
  );
};

export default Recipient;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    height: 160,
    width: 160,
  },
});

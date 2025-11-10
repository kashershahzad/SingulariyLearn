import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Header from './Molecules/Header';
import Banner from '../../Auth/LandingPage/Molecules/Banner';
import Services from '../../Auth/LandingPage/Molecules/Services';

import {useIsFocused} from '@react-navigation/native';
import {CommonActions} from '@react-navigation/native';
import {ApiRequest} from '../../../services/ApiRequest';
import Loading from '../../../components/Loading';
import {getProfile} from '../../../utils/constants';
import {useDispatch} from 'react-redux';
import {useSelector} from 'react-redux';
import Courses from '../../Auth/LandingPage/Molecules/Courses';
import PermitOption from '../DmvLicenses/Molecules/PermitOption';
import CustomText from '../../../components/CustomText';
import {useTranslation} from 'react-i18next';
import fonts from '../../../assets/fonts';
import {COLORS} from '../../../utils/COLORS';
import {use} from 'react';

const HomeScreen = ({navigation}) => {
  const isFocus = useIsFocused();
  const dispatch = useDispatch();
  const token = useSelector(state => state.authConfig.token);
  const [packagess, setpackagess] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [packages, setpackages] = useState([]);
  const [fetchError, setFetchError] = useState(false);
  const currentlanguage = useSelector(state => state.language.language);
  const {t} = useTranslation();
  const userData = useSelector(state => state.users.userData);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        dispatch(getProfile());
        setLoading(false);
      } catch (error) {
        console.log('Error fetching profile: ', error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isFocus, dispatch]);

  useEffect(() => {
    const permitData = async () => {
      setLoading(true);
      setFetchError(false);

      try {
        const body = {
          type: 'get_data',
          table_name: 'permit',
        };
        const response = await ApiRequest(body);
        console.log('response', response);

        if (response && response.data && response.data.data) {
          const rawData = response.data.data;
          const parsedData = rawData.map(item => ({
            id: item.id,
            image: item.image,
            price: item.price,
            name: JSON.parse(item.name)[currentlanguage],
            mochup: item.mockup,
            roadsign: item.road_signs,
          }));
          console.log('Fetched packagess:', parsedData);
          setpackagess(parsedData);
        } else {
          setFetchError(true);
          console.error('Invalid API response structure');
        }
      } catch (error) {
        console.error('Error fetching permit data:', error);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    permitData();
  }, [currentlanguage]);

  // Fetch packages data on component mount
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const body = {
          type: 'get_data',
          table_name: 'package',
        };
        const response = await ApiRequest(body);

        if (response.status === 200) {
          const rawPackages = response.data.data || [];

          const parsedPackages = rawPackages.map(pkg => ({
            id: pkg.id,
            title: JSON.parse(pkg.title)[currentlanguage],
            description: JSON.parse(pkg.description)[currentlanguage],
            duration: JSON.parse(pkg.duration)[currentlanguage],
            price: '$ ' + JSON.parse(pkg.price)[currentlanguage],
            vehicle: JSON.parse(pkg.vehicle)[currentlanguage],
          }));
          console.log('Fetched Packages:', parsedPackages);
          setpackages(parsedPackages);
        } else {
          console.error('API Error:', response.status);
        }
      } catch (error) {
        console.error('Fetch Error:', error);
      }
    };

    fetchPackages();
  }, [currentlanguage]);

const handlePermitSelect = (permitId) => {
  const permitdata = userData?.purchase || [];

  // Extract purchased permit IDs
  const purchasedPermitIds = permitdata.map(item => item.permit.id);

  console.log('Selected Permit ID:', permitId);
  console.log('Purchased Permit IDs:', purchasedPermitIds);

  // Find the selected permit item to get its price
  const selectedPermit = packagess.find(item => item.id === permitId);

  // Check if the selected permit was already purchased
  if (purchasedPermitIds.includes(String(permitId))) {
    // Navigate to DmvTest (or TabStack) and pass permitId
    navigation.navigate('TabStack', { 
      screen: t('Dmv Test'), 
      params: { permitId } 
    });
  } else {
    // Permit not purchased → go to Checkout
    const selectedPackage =
      packages.find(pkg => pkg.id === permitId) || packages[0];

    navigation.navigate('Checkout', {
      selectedPackage,
      permit_id: permitId,
      price2: selectedPermit?.price 
    });
  }
};


  if (loading) {
    return <Loading />;
  }

  return (
    <ScreenWrapper scrollEnabled headerUnScrollable={() => <Header />}>
      <Banner />

      <CustomText
        label={t('services')}
        fontFamily={fonts.jakartaSemiBold}
        fontSize={20}
        marginTop={15}
        marginBottom={10}
      />
      <View style={styles.container}>
        {fetchError ? (
          <View style={styles.emptyContainer}>
            <CustomText
              label={t('fetchError') || 'Failed to load permits'}
              fontFamily={fonts.medium}
              fontSize={16}
              color={COLORS.error}
              textAlign="center"
            />
          </View>
        ) : packagess.length > 0 ? (
          packagess.map((item, i) => (
            <PermitOption
              key={item.id || i}
              price={item.price}
              title={item.name}
              onPress={() => handlePermitSelect(item.id)}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <CustomText
              label={t('noPermitsAvailable') || 'No permit options available'}
              fontFamily={fonts.medium}
              fontSize={16}
              color={COLORS.gray}
              textAlign="center"
            />
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
});

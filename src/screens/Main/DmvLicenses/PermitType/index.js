import {StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Header2 from '../Molecules/Header2';
import IndexBanner from '../Molecules/IndexBanner';
import PermitOption from '../Molecules/PermitOption';
import CustomText from '../../../../components/CustomText';
import fonts from '../../../../assets/fonts';
import CustomButton from '../../../../components/CustomButton';
import {COLORS} from '../../../../utils/COLORS';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {ApiRequest} from '../../../../services/ApiRequest';
import {useSelector} from 'react-redux';
import Loading from '../../../../components/Loading';

const PermitType = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const currentlanguage = useSelector(state => state.language.language);

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
        const rawData = response.data.data;
        const parsedData = rawData.map(item => ({
          id: item.id,
          image: item.image,
          price: item.price,
          name: JSON.parse(item.name)[currentlanguage],
        }));
        console.log('Fetched Packages:', parsedData);
        setPackages(parsedData);
      } catch (error) {
        console.error('Error fetching permit data:', error);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    
    permitData();
  }, [currentlanguage]);

  if (loading) {
    return <Loading />;
  }
  if (fetchError) {
    return (
      <ScreenWrapper
        headerUnScrollable={() => (
          <Header2 title={t('yourPermitType')} line={true} />
        )}>
        <View style={styles.errorContainer}>
          <CustomText
            label={t('failedToLoadPermits') || 'Failed to load permit options'}
            fontFamily={fonts.medium}
            fontSize={16}
            color={COLORS.error}
            textAlign="center"
          />
          <CustomButton
            onPress={() => {
              setLoading(true);
              setFetchError(false);
              // Retry fetching data
              const permitData = async () => {
                try {
                  const body = {
                    type: 'get_data',
                    table_name: 'permit',
                  };
                  const response = await ApiRequest(body);
                  const rawData = response.data.data;
                  const parsedData = rawData.map(item => ({
                    id: item.id,
                    image: item.image,
                    price: item.price,
                    name: JSON.parse(item.name)[currentlanguage],
                  }));
                  setPackages(parsedData);
                  setFetchError(false);
                } catch (error) {
                  console.error('Error fetching permit data:', error);
                  setFetchError(true);
                } finally {
                  setLoading(false);
                }
              };
              permitData();
            }}
            title={t('retry') || 'Retry'}
            marginTop={20}
            height={52}
            borderRadius={10}
            backgroundColor={COLORS.btn}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      headerUnScrollable={() => (
        <Header2 title={t('yourPermitType')} line={true} />
      )}>
      <IndexBanner />
      <CustomText
        label={t('chooseYourPermitType')}
        fontFamily={fonts.medium}
        fontSize={16}
        marginTop={15}
        marginLeft={5}
        marginBottom={15}
      />

      <View style={styles.container}>
        {packages.length > 0 ? (
          packages.map((item, i) => (
            <PermitOption
              key={item.id || i}
              price={item.price}
              title={item.name}
              isSelected={selectedIndex === i}
              onPress={() => setSelectedIndex(i)}
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

      <CustomButton
        disabled={selectedIndex === null || packages.length === 0}
        onPress={() =>
          navigation.navigate('SelectPackage', {
            permit_id: packages[selectedIndex]?.id,
          })
        }
        title={t('continue')}
        marginTop={53}
        height={62}
        borderRadius={10}
        backgroundColor={
          selectedIndex === null || packages.length === 0
            ? COLORS.gray
            : COLORS.btn
        }
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
});

export default PermitType;
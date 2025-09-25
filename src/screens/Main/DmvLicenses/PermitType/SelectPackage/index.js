import { StyleSheet, Text, View, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../../../../../components/ScreenWrapper'
import Header2 from '../../Molecules/Header2'
import CustomText from '../../../../../components/CustomText'
import fonts from '../../../../../assets/fonts'
import PackageContainer from './PackageContainer'
import CustomButton from '../../../../../components/CustomButton'
import { COLORS } from '../../../../../utils/COLORS'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ApiRequest } from '../../../../../services/ApiRequest'
import Loading from '../../../../../components/Loading'

const SelectPackage = ({ navigation }) => {
  const currentlanguage = useSelector(state => state.language.language);
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [packages, setpackages] = useState([])
  const [loading, setloading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const body = {
          type: "get_data",
          table_name: "package",
        };
        const response = await ApiRequest(body);

        if (response.status === 200) {
          const rawPackages = response.data.data || [];

          const parsedPackages = rawPackages.map((pkg) => ({
            id: pkg.id,
            title: JSON.parse(pkg.title)[currentlanguage],
            description: JSON.parse(pkg.description)[currentlanguage],
            duration: JSON.parse(pkg.duration)[currentlanguage],
            price: "$ " + JSON.parse(pkg.price)[currentlanguage],
            vehicle: JSON.parse(pkg.vehicle)[currentlanguage],
          }));
          console.log("Fetched Packages:", parsedPackages);
          setpackages(parsedPackages);

          setloading(false);
        } else {
          console.error("API Error:", response.status);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    };

    fetchData();
  }, [currentlanguage]);

  return (
    <>
      {
        loading ? <Loading /> :
          <>
            <ScreenWrapper
              paddingBottom={20}
              headerUnScrollable={() => (
                <Header2 line={true} title={t('selectPackageTitle')} />
              )}
            >

              <CustomText
                label={t('adultPermit')}
                fontFamily={fonts.medium}
                fontSize={20}
                marginTop={10}
                marginLeft={5}
              />

              <FlatList
                ListEmptyComponent={<Loading />}
                data={packages}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <PackageContainer
                    plan={item.title}
                    price={item.price}
                    description={item.description}
                    vehicle={item.vehicle}
                    duration={item.duration}
                    onpress={() => setSelectedIndex(index)}
                    selectedindex={selectedIndex === index}
                  />

                )}
              />

              <CustomButton
                disabled={selectedIndex === null}
                onPress={() => {
                  if (selectedIndex !== null) {
                    navigation.navigate('Checkout', {
                      selectedPackage: packages[selectedIndex]
                    });
                  }
                }}
                title={`${t('checkoutButton')} ${selectedIndex !== null ? packages[selectedIndex].price : ''
                  }`}
                marginTop={33}
                height={62}
                borderRadius={10}
                backgroundColor={COLORS.primaryColor4}
                fontSize={16}
                fontFamily={fonts.jakartaSemiBold}
              />
            </ScreenWrapper>
          </>
      }

    </>

  )
}

export default SelectPackage

const styles = StyleSheet.create({})

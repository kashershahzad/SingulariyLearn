import {StyleSheet, View, FlatList, TouchableOpacity} from 'react-native';
import React from 'react';
import CustomText from '../../../../components/CustomText';
import fonts from '../../../../assets/fonts';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

const Courses = ({navigation}) => {
  const {t} = useTranslation()
   const packages = useSelector((state) => state.package.package);
    const userData = useSelector(state => state.users.userData)
    console.log("smdc",userData)

    

  const servicedata = [
    {
      title: 'DMV Licenses',
      function: () => userData.purchase !== undefined ? navigation.navigate('PratiseQuestion',{roadsign:false}) : navigation.navigate('PermitType'),
    },
  ];

  return (
    <View>
      <CustomText
        label={t('services')}
        fontFamily={fonts.jakartaSemiBold}
        fontSize={20}
        marginTop={15}
        marginBottom={10}
      />

      <View style={styles.grid}>
        {servicedata.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.container}
            onPress={item.function}>
            <CustomText
              label={item.title}
              fontFamily={fonts.regular}
              fontSize={16}
              textAlign="center"
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default Courses;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  container: {
    width: '100%',
    backgroundColor: '#F9F9F9',
    height: 81,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF3',
    borderRadius: 8,
    marginBottom: 10,
  },
});

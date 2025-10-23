import { StyleSheet, View, FlatList } from 'react-native';
import React from 'react';
import CustomText from '../../../../components/CustomText';
import fonts from '../../../../assets/fonts';

const Courses = () => {
  const courseList = [
    'Traffic Signs & Signals',
    'Road Rules',
    'Speed Limits',
    'Parking Rules',
    'Safety & Defensive Driving',
    'Driving Under the Influence',
    'Seat Belts & Child Safety',
    'Sharing the Road',
  ];

  return (
    <View>
      <CustomText
        label={'Courses'}
        fontFamily={fonts.jakartaSemiBold}
        fontSize={20}
        marginTop={15}
        marginBottom={10}
      />

      <View style={styles.grid}>
        {courseList.map((item, index) => (
          <View key={index} style={styles.container}>
            <CustomText
              label={item}
              fontFamily={fonts.regular}
              fontSize={16}
              textAlign="center"
            />
          </View>
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
    width: '49%',
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

import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
import React from 'react'
import ScreenWrapper from '../../../../components/ScreenWrapper'
import CustomText from '../../../../components/CustomText'
import CustomHorizontalLine from '../../../../components/CustomHorizontalLine'
import Header2 from '../../DmvLicenses/Molecules/Header2'

const Lessons = ({navigation}) => {
  const lessonsData = [
    { id: '1', name: 'Lesson 1', status: 'Completed' ,
      fnc: () => navigation.navigate('PratiseQuestion')},
    { id: '2', name: 'Lesson 2', status: 'Resume' },
    { id: '3', name: 'Lesson 3', status: 'Completed' },
    { id: '4', name: 'Lesson 4', status: 'Resume' },
    { id: '5', name: 'Lesson 5', status: 'Locked' },
    { id: '6', name: 'Lesson 6', status: 'Locked' },
  ]

  const renderLessonItem = ({ item }) => (

    <TouchableOpacity style={styles.lessonItem} onPress={item.fnc}>
      <CustomText label={item.name} style={styles.lessonName} />
      <View style={[
        styles.statusBadge,
        item.status === 'Completed' && styles.completedBadge,
        item.status === 'Resume' && styles.resumeBadge,
        item.status === 'Locked' && styles.lockedBadge,
      ]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <ScreenWrapper 
    headerUnScrollable={()=>(<Header2 title={'Lessons'}/>)}>
      <FlatList
        data={lessonsData}
        renderItem={renderLessonItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </ScreenWrapper>
  )
}

export default Lessons

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 10,
  },
  lessonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  lessonName: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
  },
  resumeBadge: {
    backgroundColor: '#FF9800',
  },
  lockedBadge: {
    backgroundColor: '#9E9E9E',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
})
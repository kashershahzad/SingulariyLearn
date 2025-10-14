import {StyleSheet, Text, View, FlatList, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import CustomText from '../../../../components/CustomText';
import Header2 from '../../DmvLicenses/Molecules/Header2';
import {ApiRequest} from '../../../../services/ApiRequest';
import {useSelector} from 'react-redux';

const Lessons = ({navigation}) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentLanguage = useSelector(state => state.language.language);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const body = {
          type: 'get_data',
          table_name: 'lesson',
        };

        const response = await ApiRequest(body);
        if (response && response.status === 200) {
          console.log('lessons', response.data);
          const rawData = response.data.data;

          const processedData = rawData.map(item => ({
            id: item.id.toString(),
            name: JSON.parse(item.name)[currentLanguage] || JSON.parse(item.name).en,
            status: 'Start',
          }));

          setLessons(processedData);
        } else {
          console.log('Error in lessons api');
        }
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [currentLanguage]);

  // Fixed: Accept separate parameters instead of object
  const handleLessonPress = (id, name) => {
    navigation.navigate('LessonPage', { lesson_id: id, name });
  };

  const renderLessonItem = ({item}) => (
    <TouchableOpacity 
      style={styles.lessonItem} 
      onPress={() => handleLessonPress(item.id, item.name)}>
      <CustomText label={item.name} style={styles.lessonName} />
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScreenWrapper headerUnScrollable={() => <Header2 title={'Lessons'} />}>
        <View style={styles.loadingContainer}>
          <CustomText label="Loading lessons..." />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper headerUnScrollable={() => <Header2 title={'Lessons'} />}>
      <FlatList
        data={lessons}
        renderItem={renderLessonItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <CustomText label="No lessons available" />
          </View>
        }
      />
    </ScreenWrapper>
  );
};

export default Lessons;

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
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
});
import {ScrollView, StyleSheet, Text, View,} from 'react-native';
import React, {useState, useEffect} from 'react';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import ImageFast from '../../../../components/ImageFast';
import {Images} from '../../../../assets/images';
import {COLORS} from '../../../../utils/COLORS';
import Testfrom from '../mockuptest/Testfrom';
import {useTranslation} from 'react-i18next';
import MockupHeader from '../Molecules/MockupHeader';
import {ApiRequest} from '../../../../services/ApiRequest';
import Header2 from '../../DmvLicenses/Molecules/Header2';
import CustomText from '../../../../components/CustomText';
import fonts from '../../../../assets/fonts';
import Lessons from './Lessons';
import { useSelector } from 'react-redux';
import Loading from '../../../../components/Loading';


const PratiseQuestion = ({navigation}) => {
  const {t} = useTranslation();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentLanguage = useSelector(state => state.language.language);
  const token = useSelector(state => state.authConfig.token);
  // const [percentage, setpercentage] = useState()

    useEffect(() => {
      const fetchLessons = async () => {
        try {
          const body = {
            type: 'get_data',
            table_name: 'lesson',
            limit:100,
            user_id:token,
          };
  
          const response = await ApiRequest(body);
          if (response && response.status === 200) {
            console.log('lessons', response.data);
            const rawData = response.data.data;
            // const percentage = response.data.percentage;
            // setpercentage(percentage)
            const processedData = rawData.map(item => ({
              id: item.id.toString(),
              percentage: item.percentage.toString(),
              name: JSON.parse(item.name)[currentLanguage],
              description: JSON.parse(item.description)[currentLanguage],
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
  
    const handleLessonPress = (id, name) => {
      navigation.navigate('Questions', { id: id, name });
    };

    if (loading) {
    return (
      <Loading/>
    );
  }

  return (
    <ScreenWrapper
      scrollEnabled
      statusBarColor={COLORS.primaryColor4}
      backgroundColor='white'
      headerUnScrollable={() => <Header2 line={true} title={t('Practise Question')} />}>
      <CustomText
        label={t('Lessons')}
        fontFamily={fonts.medium}
        fontSize={16}
        marginTop={10}
        marginLeft={5}
        marginBottom={7}
      />
      <View style={styles.container}>
        {lessons.map((lesson) => (
          <Lessons
            key={lesson.id}
            id={lesson.id}
            name={lesson.name}
            status={lesson.status}
            onPress={() => handleLessonPress(lesson.id, lesson.name)}
            percentage={lesson.percentage}
          />
        ))}
      </View>
    </ScreenWrapper>
  );
};

export default PratiseQuestion;

const styles = StyleSheet.create({
  container:{
    gap:10
  }
});
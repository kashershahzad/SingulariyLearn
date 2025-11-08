import React, {useState, useRef} from 'react';
import {StyleSheet, View, ScrollView, TouchableOpacity, Text} from 'react-native';
import CustomText from '../../../../../components/CustomText';
import ImageFast from '../../../../../components/ImageFast';
import {Images} from '../../../../../assets/images';
import {COLORS} from '../../../../../utils/COLORS';
import {useTranslation} from 'react-i18next';
import Video from 'react-native-video';
import fonts from '../../../../../assets/fonts';

const QuestionsContainer = ({
  questionNumber,
  question,
  answer,
  totalQuestion,
  image,
  video,
  audio,
}) => {
  const {t} = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  const progress = (questionNumber / totalQuestion) * 100;

  const handleAudioPress = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <CustomText
            label={`${t('question')} ${questionNumber}/${totalQuestion}`}
            fontFamily={fonts.jakartaBold}
            fontSize={16}
            color={'#4F4F4F'}
          />

          <TouchableOpacity onPress={handleAudioPress}>
            <ImageFast
              source={isPlaying ? Images.audiobtn : Images.audiobtn}
              resizeMode="contain"
              style={styles.audio}
            />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.lineBackground}>
          <View style={[styles.lineProgress, {width: `${progress}%`}]} />
        </View>

        {/* Question */}
        <View style={{minHeight: 150}}>
          <CustomText
            label={question}
            fontFamily={fonts.regular}
            marginTop={10}
            fontSize={16}
          />
        </View>

        {/* Show either video OR image (never both) */}
        <View
          style={{height: 200, justifyContent: 'center', alignItems: 'center'}}>
          {video ? (
            <Video
              ref={videoRef}
              source={{uri: video}}
              style={styles.video}
              resizeMode="contain"
              repeat
              paused={false}
              muted={false}
              controls={true}
              onError={e => console.log('Video error:', e)}
            />
          ) : image ? (
            <ImageFast
              source={{uri: image}}
              resizeMode="contain"
              style={styles.icon}
            />
          ) : (
            <View
              style={{
                height: 200,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{color: 'gray'}}>{t('noMedia')}</Text>
            </View>
          )}
        </View>

        {/* Answer */}
        <View style={styles.option}>
          <CustomText
            textAlign="center"
            label={answer}
            fontFamily={fonts.regular}
            fontSize={14}
            color="#707070"
          />
        </View>

        {/* Hidden audio player */}
        {audio && (
          <Video
            ref={audioRef}
            source={{uri: audio}}
            paused={!isPlaying}
            onEnd={() => setIsPlaying(false)}
            audioOnly
            playInBackground={false}
            
            style={styles.audioElement}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default QuestionsContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    padding: 20,
    marginTop: -30,
    paddingBottom: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lineBackground: {
    height: 4,
    borderRadius: 10,
    backgroundColor: '#b9bad3ff',
    marginTop: 10,
  },
  lineProgress: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: COLORS.btn,
  },
  option: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#ECEFF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 5,
    paddingVertical: 15,
    borderRadius: 8,
    minHeight: 120,
  },
  audio: {
    height: 23,
    width: 23,
  },
  audioElement: {
    width: 0,
    height: 0,
  },
  icon: {
    height: 202,
    width: 181,
    alignSelf: 'center',
    marginBottom: 5,
  },
  video: {
    height: 200,
    width: '100%',
    borderRadius: 10,
    marginVertical: 10,
  },
});

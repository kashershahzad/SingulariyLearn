import React, {useState, useRef, useEffect} from 'react';
import {StyleSheet, View, ScrollView, TouchableOpacity, Text, Alert} from 'react-native';
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
  const [mediaError, setMediaError] = useState(false);
  const [mediaType, setMediaType] = useState('unknown'); // 'video', 'audio', 'image', 'unknown'
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  const progress = (questionNumber / totalQuestion) * 100;

  // Detect media type from URL
  const detectMediaType = (url) => {
    if (!url) return 'unknown';
    
    const urlLower = url.toLowerCase();
    
    // Audio file extensions
    const audioExtensions = ['.mp3', '.wav', '.aac', '.m4a', '.ogg', '.flac'];
    // Video file extensions  
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'];
    // Image file extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    
    if (audioExtensions.some(ext => urlLower.includes(ext))) return 'audio';
    if (videoExtensions.some(ext => urlLower.includes(ext))) return 'video';
    if (imageExtensions.some(ext => urlLower.includes(ext))) return 'image';
    
    return 'unknown';
  };

  // Check if answer is an image URL
  const isAnswerImage = () => {
    if (!answer) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const answerLower = answer.toLowerCase();
    return imageExtensions.some(ext => answerLower.includes(ext));
  };

  useEffect(() => {
    if (video) {
      const detectedType = detectMediaType(video);
      setMediaType(detectedType);
      setMediaError(false);
      console.log('Detected media type:', detectedType, 'for URL:', video);
    }
  }, [video]);

  const handleAudioPress = () => {
    setIsPlaying(prev => !prev);
  };

  const handleVideoError = (error) => {
    console.log('Media playback error:', error);
    setMediaError(true);
    
    // If we thought it was video but failed, check if it's actually audio
    if (mediaType === 'video') {
      const detectedType = detectMediaType(video);
      if (detectedType === 'audio') {
        setMediaType('audio');
        console.log('Auto-corrected to audio type after playback failure');
      }
    }
  };

  const handleAudioPlayback = () => {
    setIsPlaying(prev => !prev);
  };

  const renderMediaContent = () => {
    // If we have an image and no video, show image
    if (image && !video) {
      return (
        <ImageFast
          source={{uri: image}}
          resizeMode="contain"
          style={styles.icon}
        />
      );
    }

    // If we have video/audio content
    if (video) {
      // Show video player for actual video files that haven't errored
      if (mediaType === 'video' && !mediaError) {
        return (
          <Video
            ref={videoRef}
            source={{uri: video}}
            style={styles.video}
            resizeMode="contain"
            paused={false}
            muted={false}
            controls={true}
            onError={handleVideoError}
            onLoad={() => console.log('Video loaded successfully')}
          />
        );
      }
      
      // Show audio player for audio files OR when video playback fails for audio content
      if (mediaType === 'audio' || (mediaError && detectMediaType(video) === 'audio')) {
        return (
          <View style={styles.audioContainer}>
            <TouchableOpacity 
              style={[styles.audioPlayButton, isPlaying && styles.audioPlayingButton]}
              onPress={handleAudioPlayback}
            >
              <ImageFast
                source={isPlaying ? Images.pause : Images.play}
                resizeMode="contain"
                style={styles.audioButtonIcon}
              />
            </TouchableOpacity>
            <CustomText
              label={t('audioPlayback')}
              fontFamily={fonts.regular}
              fontSize={14}
              color={COLORS.gray}
              marginTop={10}
            />
            {mediaError && (
              <CustomText
                label={t('fallbackAudioMode')}
                fontFamily={fonts.regular}
                fontSize={12}
                color={COLORS.orange}
                marginTop={5}
              />
            )}
          </View>
        );
      }
      
      // Show error for failed video playback
      if (mediaError) {
        return (
          <View style={styles.errorContainer}>
            <CustomText
              label={t('playbackError')}
              fontFamily={fonts.bold}
              fontSize={16}
              color={COLORS.red}
            />
            <CustomText
              label={t('unsupportedFormat')}
              fontFamily={fonts.regular}
              fontSize={14}
              color={COLORS.gray}
              marginTop={5}
              textAlign="center"
            />
          </View>
        );
      }
    }

    // Default fallback - no media
    return (
      <View style={styles.placeholder}>
        <CustomText
          label={t('noMedia')}
          fontFamily={fonts.regular}
          fontSize={14}
          color={COLORS.gray}
        />
      </View>
    );
  };

  const renderAnswerContent = () => {
    // If answer is an image URL, show ImageFast
    if (isAnswerImage()) {
      return (
        <View style={styles.option}>
          <ImageFast
            source={{uri: answer}}
            resizeMode="contain"
            style={styles.answerImage}
          />
        </View>
      );
    }
    
    // If answer has audio and is text, show both audio button and text
    if (audio && answer) {
      return (
        <View style={styles.option}>
          <View style={styles.audioAnswerContainer}>
            <ImageFast
              source={Images.audiobtn}
              onPress={handleAudioPress}
              resizeMode={'contain'}
              style={styles.audio}
            />
            <CustomText
              textAlign="center"
              label={answer}
              fontFamily={fonts.regular}
              fontSize={14}
              color="#707070"
              marginLeft={10}
              flex={1}
            />
          </View>
        </View>
      );
    }
    
    // Default: show text answer
    return (
      <View style={styles.option}>
        <CustomText
          textAlign="center"
          label={answer}
          fontFamily={fonts.regular}
          fontSize={14}
          color="#707070"
        />
      </View>
    );
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

          {/* Original audio button */}
          {audio && (
            <TouchableOpacity onPress={handleAudioPress}>
              <ImageFast
                source={isPlaying ? Images.audiobtn : Images.audiobtn}
                resizeMode="contain"
                style={styles.audio}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.lineBackground}>
          <View style={[styles.lineProgress, {width: `${progress}%`}]} />
        </View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <CustomText
            label={question}
            fontFamily={fonts.regular}
            marginTop={10}
            fontSize={16}
          />
        </View>

        {/* Media Section */}
        <View style={styles.mediaWrapper}>
          {renderMediaContent()}
        </View>

        {/* Answer - Conditionally rendered */}
        {renderAnswerContent()}

        {/* Hidden audio player for original audio prop */}
        {audio && (
          <Video
            ref={audioRef}
            source={{uri: audio}}
            paused={!isPlaying}
            onEnd={() => setIsPlaying(false)}
            audioOnly={true}
            playInBackground={false}
            onError={(e) => {
              console.log('Audio playback error:', e);
              setIsPlaying(false);
            }}
            style={styles.audioElement}
          />
        )}

        {/* Hidden audio player for video URLs that are actually audio files */}
        {video && (mediaType === 'audio' || (mediaError && detectMediaType(video) === 'audio')) && (
          <Video
            ref={audioRef}
            source={{uri: video}}
            paused={!isPlaying}
            onEnd={() => setIsPlaying(false)}
            onError={(e) => {
              console.log('Audio playback error:', e);
              setIsPlaying(false);
              setMediaError(true);
            }}
            onLoad={() => {
              console.log('Audio loaded successfully');
              setMediaError(false);
            }}
            audioOnly={true}
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
  questionContainer: {
    minHeight: 150,
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
  audioAnswerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  answerImage: {
    height: 100,
    width: '100%',
    borderRadius: 8,
  },
  audio: {
    height: 23,
    width: 23,
  },
  audioElement: {
    width: 0,
    height: 0,
    position: 'absolute',
  },
  icon: {
    height: 202,
    width: 181,
    alignSelf: 'center',
  },
  video: {
    height: 200,
    width: '100%',
    borderRadius: 10,
  },
  mediaWrapper: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  audioContainer: {
    height: 200,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e9ecef',
    padding: 20,
  },
  audioPlayButton: {
    padding: 20,
    backgroundColor: COLORS.btn,
    borderRadius: 50,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  audioPlayingButton: {
    backgroundColor: COLORS.primary, // Use a different color when playing
  },
  audioButtonIcon: {
    height: 30,
    width: 30,
    tintColor: 'white',
  },
  errorContainer: {
    height: 200,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff3f3',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffcdd2',
    padding: 20,
  },
  placeholder: {
    height: 200,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ececec',
  },
});
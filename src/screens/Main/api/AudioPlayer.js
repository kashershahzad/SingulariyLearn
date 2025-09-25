import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Video from 'react-native-video';

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <View style={styles.container}>
      <Video
        source={require('../../../assets/audio/q1.mp3')}
        paused={!isPlaying}
        audioOnly={true}
        style={styles.audioElement}
      />
      
      <TouchableOpacity onPress={togglePlayback} style={styles.button}>
        <Text style={styles.buttonText}>
          {isPlaying ? 'Pause' : 'Play'} Audio
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  audioElement: {
    width: 0,
    height: 0,
  },
});

export default AudioPlayer;
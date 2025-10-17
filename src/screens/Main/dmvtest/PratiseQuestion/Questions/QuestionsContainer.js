import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import CustomText from '../../../../../components/CustomText';
import fonts from '../../../../../assets/fonts';
import ImageFast from '../../../../../components/ImageFast';
import {Images} from '../../../../../assets/images';
import CustomHorizontalLine from '../../../../../components/CustomHorizontalLine';

const QuestionsContainer = ({id, questionNumber, question, answer}) => {
  const [model, setmodel] = useState(false);
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.mincontainer} 
        onPress={() => setmodel(!model)}
      >
        <CustomText
          label={`Question ${questionNumber}`}
          fontFamily={fonts.regular}
          fontSize={14}
          color={'#ED7D20'}
        />

        <ImageFast
          source={Images.downarrow}
          resizeMode={'contain'}
          style={[
            styles.icon,
            model && {transform: [{rotate: '180deg'}]}
          ]}
        />
      </TouchableOpacity>

      <CustomText
        label={question}
        fontFamily={fonts.regular}
        fontSize={11}
        marginBottom={5}
      />

      {model && (
        <View>
          <CustomHorizontalLine height={1}/>
          <CustomText
            label={'Answer'}
            fontFamily={fonts.regular}
            fontSize={14}
            marginTop={10}
            color={'#ED7D20'}
            style={{marginTop: 10}}
          />
          <CustomText
            label={answer}
            fontFamily={fonts.regular}
            fontSize={11}
            style={{marginTop: 5}}
          />
        </View>
      )}
    </View>
  );
};

export default QuestionsContainer;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#ECEFF3',
    borderRadius: 8,
    padding: 10,
  },
  mincontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    height: 10,
    width: 10,
    marginTop: 8,
  },
});
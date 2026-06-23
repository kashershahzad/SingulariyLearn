import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import fonts from '../../../assets/fonts';

const SwitchbuttonComponent = ({
  activeTab = 'login',
  onChangeTab = () => {},
  leftLabel = 'Sign In',
  rightLabel = 'Sign Up',
}) => {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onChangeTab('login')}
        style={[
          styles.tabButton,
          activeTab === 'login' ? styles.activeTab : styles.inactiveTab,
        ]}>
        <Text
          style={[
            styles.tabText,
            activeTab === 'login' ? styles.activeText : styles.inactiveText,
          ]}>
          {leftLabel}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onChangeTab('signup')}
        style={[
          styles.tabButton,
          activeTab === 'signup' ? styles.activeTab : styles.inactiveTab,
        ]}>
        <Text
          style={[
            styles.tabText,
            activeTab === 'signup' ? styles.activeText : styles.inactiveText,
          ]}>
          {rightLabel}
        </Text>
      </Pressable>
    </View>
  );
};

export default SwitchbuttonComponent;

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    backgroundColor: '#F4F4F4',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    width: '100%',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    height: 56,
  },
  activeTab: {
    backgroundColor: '#1296E0',
  },
  inactiveTab: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  activeText: {
    color: '#FFFFFF',
  },
  inactiveText: {
    color: '#1296E0',
  },
});
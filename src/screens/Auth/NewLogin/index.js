import {StyleSheet, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import ScreenWrapper from '../../../components/ScreenWrapper';
import ImageFast from '../../../components/ImageFast';
import {Images} from '../../../assets/images';
import SwitchbuttonComponent from './SwitchbuttonComponent';
import Language from './Language';
import SelectExamCountry from './SelectExamCountry';
import Goals from './Goals';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import {fetchGoals} from './goalsApi';

const NewLogin = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('login');
  const [showLanguageAfterSignup, setShowLanguageAfterSignup] = useState(false);
  const [showSelectExamCountry, setShowSelectExamCountry] = useState(false);
  const [signupData, setSignupData] = useState(null);
  const [selectedLanguageId, setSelectedLanguageId] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [showGoals, setShowGoals] = useState(false);
  const goalsRef = useRef([]);

  useEffect(() => {
    if (!showLanguageAfterSignup) {
      return;
    }

    let cancelled = false;

    const loadGoals = async () => {
      try {
        const list = await fetchGoals();
        if (!cancelled) {
          goalsRef.current = list;
        }
      } catch (error) {
        console.error('Error fetching goals:', error);
      }
    };

    loadGoals();

    return () => {
      cancelled = true;
    };
  }, [showLanguageAfterSignup]);

  return (
    <ScreenWrapper
      backgroundColor="#DBF2FF"
      paddingHorizontal={0}
      scrollEnabled={true}
      statusBarColor="#DBF2FF">
      <View style={styles.container}>
        <ImageFast
          source={Images.newlogo}
          resizeMode={'contain'}
          style={styles.logo}
        />
      </View>
      <View style={styles.content}>
        {showGoals ? (
          <Goals
            navigation={navigation}
            signupData={signupData}
            languageId={selectedLanguageId}
            examCountry={selectedCountryId}
            goals={goalsRef.current}
          />
        ) : showSelectExamCountry ? (
          <SelectExamCountry
            signupData={signupData}
            languageId={selectedLanguageId}
            onContinue={countryId => {
              setSelectedCountryId(countryId);
              setShowGoals(true);
            }}
          />
        ) : showLanguageAfterSignup ? (
          <Language
            onContinue={languageId => {
              setSelectedLanguageId(languageId);
              setShowSelectExamCountry(true);
            }}
          />
        ) : (
          <>
            <SwitchbuttonComponent
              activeTab={activeTab}
              onChangeTab={setActiveTab}
            />

            {activeTab === 'login' ? (
              <LoginForm
                navigation={navigation}
                onSwitchToSignup={() => setActiveTab('signup')}
                onLoginSuccess={() =>
                  navigation.navigate('MainStack', {screen: 'TabStack'})
                }
              />
            ) : (
              <SignupForm
                onSwitchToLogin={() => setActiveTab('login')}
                onNext={data => {
                  setSignupData(data);
                  setShowLanguageAfterSignup(true);
                }}
              />
            )}
          </>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default NewLogin;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    backgroundColor: '#DBF2FF',
  },
  logo: {
    width: 156,
    height: 34,
  },
  content: {
    flex: 1,
    marginTop: 24,
    backgroundColor: 'white',
    padding: 16,
  },
});

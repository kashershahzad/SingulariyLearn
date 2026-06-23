import {StyleSheet, View, ScrollView, ActivityIndicator} from 'react-native';
import React, {useEffect, useState} from 'react';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import SelectionBox from './SelectionBox';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from '../../../components/CustomButton';
import {fetchGoals, mapGoalForDisplay} from './goalsApi';
import {useTranslation} from 'react-i18next';
import {ApiRequest} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';
import {useDispatch} from 'react-redux';
import {setToken} from '../../../store/reducer/AuthConfig';
import {getProfile} from '../../../utils/constants';
import Loading from '../../../components/Loading';

const Goals = ({
  navigation,
  goals: goalsProp,
  signupData,
  languageId,
  examCountry,
}) => {
  const dispatch = useDispatch();
  const {i18n} = useTranslation();
  const langCode = i18n.language?.split('-')[0] || 'en';
  const [goals, setGoals] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(!goalsProp?.length);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (goalsProp?.length) {
      const mapped = goalsProp.map(item => mapGoalForDisplay(item, langCode));
      setGoals(mapped);
      setSelectedId(mapped[0]?.id || '');
      setLoading(false);
      return;
    }

    const loadGoals = async () => {
      try {
        const list = await fetchGoals();
        const mapped = list.map(item => mapGoalForDisplay(item, langCode));
        setGoals(mapped);
        if (mapped.length > 0) {
          setSelectedId(mapped[0].id);
        }
      } catch (error) {
        console.error('Error fetching goals:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, [goalsProp, langCode]);

  const handleRegister = async () => {
    if (!signupData || !selectedId || !languageId || !examCountry) {
      ToastMessage('Please complete all registration steps.');
      return;
    }

    try {
      setSubmitting(true);
      const body = {
        type: 'register',
        reg_type: 'email',
        first_name: signupData.first_name,
        last_name: signupData.last_name,
        email: signupData.email,
        phone: signupData.phone || '',
        password: signupData.password,
        language_id: languageId,
        exam_country: examCountry,
        goal_id: selectedId,
      };
      console.log(body);

      const response = await ApiRequest(body);

      if (response.data.result === 'false' || response.data.result === false) {
        ToastMessage(response.data.message);
      } else {
        ToastMessage(response.data.message);
        const token = response.data?.user_id;
        if (token) {
          dispatch(setToken(token));
          await dispatch(getProfile());
        }
        navigation.navigate('MainStack', {screen: 'TabStack'});
      }
    } catch (error) {
      console.error('Registration failed:', error);
      ToastMessage('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) {
    return <Loading />;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <CustomText
          label="Choose Your Goal"
          marginTop={24}
          fontSize={30}
          fontFamily={fonts.semiBold}
          lineHeight={42}
        />
        <CustomText
          label="Start with Driving Permit. You can add English and immigration later."
          fontSize={16}
          fontFamily={fonts.regular}
          color={'#929292'}
          lineHeight={24}
          marginBottom={10}
        />
        {loading ? (
          <ActivityIndicator size="large" color="#0298EF" style={styles.loader} />
        ) : (
          <View style={styles.list}>
            {goals.map(item => (
              <SelectionBox
                key={item.id}
                goals
                iconUri={item.iconUrl}
                tags={item.tags}
                title={item.title}
                subtitle={item.subtitle}
                selected={selectedId === item.id}
                onPress={() => setSelectedId(item.id)}
              />
            ))}
          </View>
        )}
        <CustomText
          label="Note: Your goal affects your dashboard and recommended study path."
          fontSize={13}
          fontFamily={fonts.regular}
          color={'#929292'}
          lineHeight={20}
          marginTop={8}
          marginBottom={4}
        />
      </ScrollView>
      <LinearGradient
        colors={['#0298EF', '#1075B1']}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
        style={styles.footer}>
        <CustomButton
          onPress={handleRegister}
          title={'Sign In'}
          height={51}
          customStyle={{backgroundColor: 'transparent'}}
        />
      </LinearGradient>
    </View>
  );
};

export default Goals;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  list: {
    marginTop: 10,
    gap: 10,
  },
  loader: {
    marginTop: 24,
  },
  footer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 12,
  },
});

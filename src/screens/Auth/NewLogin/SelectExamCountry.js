import {StyleSheet, View, ScrollView, ActivityIndicator} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import SearchInput from '../../../components/SearchInput';
import SelectionBox from './SelectionBox';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from '../../../components/CustomButton';
import {ApiRequest} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';

const mapCountryItem = item => ({
  id: String(item.id ?? item.country_id ?? item.exam_country ?? ''),
  title: item.country ?? item.country_name ?? item.name ?? item.title ?? '',
  subtitle: item.description ?? item.subtitle ?? '',
});

const SelectExamCountry = ({signupData, languageId, onContinue}) => {
  const [search, setSearch] = useState('');
  const [countries, setCountries] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const body = {
          type: 'get_data',
          table_name: 'countries',
        };
        const result = await ApiRequest(body);
        const list = (result.data?.data || []).map(mapCountryItem);
        setCountries(list);
        if (list.length > 0) {
          setSelectedId(list[0].id);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return countries;
    }
    return countries.filter(
      c =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q),
    );
  }, [search, countries]);

  const handleContinue = () => {
    if (!signupData || !selectedId || !languageId) {
      ToastMessage('Please complete all registration steps.');
      return;
    }
    onContinue?.(selectedId);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <CustomText
          label="Select Exam Country"
          marginTop={24}
          fontSize={30}
          fontFamily={fonts.semiBold}
          lineHeight={42}
        />
        <CustomText
          label="Choose the country where you will take your driving permit test."
          fontSize={16}
          fontFamily={fonts.regular}
          color={'#929292'}
          lineHeight={24}
          marginBottom={10}
        />
        <SearchInput
          placeholder="Search Country"
          value={search}
          onChangeText={setSearch}
          iconPosition="right"
        />
        {loading ? (
          <ActivityIndicator size="large" color="#0298EF" style={styles.loader} />
        ) : (
          <View style={styles.list}>
            {filteredCountries.map(item => (
              <SelectionBox
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                selected={selectedId === item.id}
                onPress={() => setSelectedId(item.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <LinearGradient
        colors={['#0298EF', '#1075B1']}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
        style={styles.footer}>
        <CustomButton
          onPress={handleContinue}
          title={'Continue'}
          height={51}
          customStyle={{backgroundColor: 'transparent'}}
        />
      </LinearGradient>
    </View>
  );
};

export default SelectExamCountry;

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

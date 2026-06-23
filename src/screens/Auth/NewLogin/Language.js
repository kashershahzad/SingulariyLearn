import {StyleSheet, View, ScrollView, ActivityIndicator} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import SearchInput from '../../../components/SearchInput';
import SelectionBox from './SelectionBox';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from '../../../components/CustomButton';
import {ApiRequest} from '../../../services/ApiRequest';
import {setLanguage} from '../../../store/reducer/LanguageConfig';

// const LANGUAGES = [
//   {id: 'en', title: 'English', subtitle: 'Recommended'},
//   {id: 'ar', title: 'العربية', subtitle: 'Arabic (RTL)'},
//   {id: 'ur', title: 'اردو', subtitle: 'Urdu (RTL)'},
//   {id: 'fr', title: 'Français', subtitle: 'French'},
// ];

const mapLanguageItem = item => ({
  id: String(item.id ?? item.language_id ?? item.lang_code ?? ''),
  langCode: String(item.lang_code ?? item.id ?? 'en'),
  title: item.language ?? item.name ?? item.title ?? '',
  subtitle: item.lang_code ?? item.subtitle ?? '',
});

const Language = ({onContinue}) => {
  const dispatch = useDispatch();
  const {i18n} = useTranslation();
  const [search, setSearch] = useState('');
  const [languages, setLanguages] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const body = {
          type: 'get_data',
          table_name: 'languages',
        };
        const result = await ApiRequest(body);
        const list = (result.data?.data || []).map(mapLanguageItem);
        setLanguages(list);
        if (list.length > 0) {
          setSelectedId(list[0].id);
        }
      } catch (error) {
        console.error('Error fetching languages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLanguages();
  }, []);

  const filteredLanguages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return languages;
    }
    return languages.filter(
      l =>
        l.title.toLowerCase().includes(q) ||
        l.subtitle.toLowerCase().includes(q),
    );
  }, [search, languages]);

  const handleContinue = () => {
    if (!selectedId) {
      return;
    }
    const selected = languages.find(item => item.id === selectedId);
    const langCode = selected?.langCode || 'en';
    dispatch(setLanguage(langCode));
    i18n.changeLanguage(langCode);
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
          label="screens.newLoginLanguage.chooseLanguage"
          marginTop={24}
          fontSize={30}
          fontFamily={fonts.semiBold}
          lineHeight={42}
        />
        <CustomText
          label="screens.newLoginLanguage.chooseLanguageSubtitle"
          fontSize={16}
          fontFamily={fonts.regular}
          color={'#929292'}
          lineHeight={24}
          marginBottom={10}
        />
        <SearchInput
          placeholder={i18n.t('screens.newLoginLanguage.searchLanguage')}
          value={search}
          onChangeText={setSearch}
          iconPosition="right"
        />
        {loading ? (
          <ActivityIndicator size="large" color="#0298EF" style={styles.loader} />
        ) : (
          <View style={styles.list}>
            {filteredLanguages.map(item => (
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
          title="screens.newLoginLanguage.continue"
          height={51}
          customStyle={{backgroundColor: 'transparent'}}
        />
      </LinearGradient>
    </View>
  );
};

export default Language;

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

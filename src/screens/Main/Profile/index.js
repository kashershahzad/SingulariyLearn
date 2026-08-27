import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';
import {getProfile} from '../../../utils/constants';
import {logout} from '../../../store/reducer/AuthConfig';
import {logoutUser} from '../../../store/reducer/usersSlice';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Header2 from '../DmvLicenses/Molecules/Header2';
import ImageFast from '../../../components/ImageFast';
import {Images} from '../../../assets/images';
import CustomText from '../../../components/CustomText';
import CustomToggle from '../../../components/CustomToggle';
import fonts from '../../../assets/fonts';
import {useTheme, useThemedStyles} from '../../../theme/useTheme';

const Profile = ({navigation}) => {
  const isFocused = useIsFocused();
  const userData = useSelector(state => state.users.userData);
  const currentLanguage = useSelector(state => state.language.language);
  const dispatch = useDispatch();
  const {colors, isDarkMode, setDarkMode} = useTheme();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: c.screenBg,
        padding: 20,
      },
      icon: {
        width: 128,
        height: 128,
        borderRadius: 100,
        alignSelf: 'center',
        zIndex: 0,
      },
      iconContainer: {
        position: 'relative',
        alignSelf: 'center',
        marginTop: 20,
      },
      icon2: {
        width: 27,
        height: 27,
        position: 'absolute',
        right: 4,
        bottom: 4,
        zIndex: 1,
      },
      optionsContainer: {
        backgroundColor: c.card,
        borderRadius: 10,
        padding: 20,
        paddingBottom: 10,
        marginTop: 15,
        borderWidth: 1,
        borderColor: c.border,
      },
      optionItemContainer: {
        backgroundColor: c.iconBg,
        borderRadius: 5,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
      },
      optionIcon: {
        width: 18,
        height: 18,
      },
      optionTextWrap: {
        flex: 1,
      },
      optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      },
      switchWrap: {
        paddingTop: 2,
      },
      divider: {
        height: 1,
        backgroundColor: c.divider,
        marginVertical: 10,
      },
      proBadge: {
        backgroundColor: c.proBadgeBg,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 999,
        width: 124,
        alignSelf: 'center',
        marginTop: 10,
      },
    }),
  );

  const token = useSelector(state => state.authConfig.token);

  useEffect(() => {
    if (isFocused && token) {
      dispatch(getProfile());
    }
  }, [isFocused, token, dispatch]);

  const profileSections = useMemo(
    () => [
      {
        id: 'learningProgress',
        titleKey: 'profileMenu.sections.learningProgress',
        items: [
          {
            id: 'dashboard',
            titleKey: 'profileMenu.items.dashboard',
            subtitleKey: 'profileMenu.items.dashboardSubtitle',
            icon: 'profileDashboard',
            onPress: () => navigation.navigate('Home'),
          },
          {
            id: 'enrolledCourses',
            titleKey: 'profileMenu.items.enrolledCourses',
            subtitleKey: 'profileMenu.items.enrolledCoursesSubtitle',
            icon: 'profileEnrolledCourses',
            onPress: () => navigation.navigate('CourseEnrolled'),
          },
          // {
          //   id: 'allCourses',
          //   titleKey: 'profileMenu.items.allCourses',
          //   subtitleKey: 'profileMenu.items.allCoursesSubtitle',
          //   icon: 'profileEnrolledCourses',
          //   onPress: () => navigation.navigate('LandingPage'),
          // },
          {
            id: 'bookmarks',
            titleKey: 'profileMenu.items.bookmarks',
            subtitleKey: 'profileMenu.items.bookmarksSubtitle',
            icon: 'profileBookmarks',
            onPress: () => navigation.navigate('Bookmarks'),
          },
        ],
      },
      {
        id: 'accountPayments',
        titleKey: 'profileMenu.sections.accountPayments',
        items: [
          {
            id: 'payments',
            titleKey: 'profileMenu.items.payments',
            subtitleKey: 'profileMenu.items.paymentsSubtitle',
            icon: 'profilePayments',
            onPress: () => navigation.navigate('Payments'),
          },
        ],
      },
      {
        id: 'settingsPreferences',
        titleKey: 'profileMenu.sections.settingsPreferences',
        items: [
          {
            id: 'settings',
            titleKey: 'profileMenu.items.settings',
            subtitleKey: 'profileMenu.items.settingsSubtitle',
            icon: 'profileSettings',
            onPress: () => navigation.navigate('Settings'),
          },
          {
            id: 'notifications',
            titleKey: 'profileMenu.items.notifications',
            subtitleKey: 'profileMenu.items.notificationsSubtitle',
            icon: 'profileNotification',
            onPress: () => navigation.navigate('ProfileNotifications'),
          },
          {
            id: 'darkMode',
            titleKey: 'profileMenu.items.darkMode',
            subtitleKey: 'profileMenu.items.darkModeSubtitle',
            icon: 'profileDarkMode',
            type: 'toggle',
          },
          {
            id: 'language',
            titleKey: 'profileMenu.items.language',
            subtitleKey: currentLanguage === 'ur' ? 'urdu' : 'English',
            icon: 'profileLanguage',
            onPress: () => navigation.navigate('Language'),
          },
        ],
      },
      {
        id: 'supportInfo',
        titleKey: 'profileMenu.sections.supportInfo',
        items: [
          {
            id: 'helpSupport',
            titleKey: 'profileMenu.items.helpSupport',
            subtitleKey: 'profileMenu.items.helpSupportSubtitle',
            icon: 'profileSupport',
            onPress: () => navigation.navigate('HelpAndSupport'),
          },
          {
            id: 'about',
            titleKey: 'profileMenu.items.about',
            subtitleKey: 'profileMenu.items.aboutSubtitle',
            icon: 'profileAbout',
            onPress: () => navigation.navigate('About'),
          },
          {
            id: 'logout',
            titleKey: 'profileMenu.items.logout',
            subtitleKey: 'profileMenu.items.logoutSubtitle',
            icon: 'profileLogout',
            onPress: () => {
              dispatch(logoutUser());
              dispatch(logout());
            },
          },
        ],
      },
    ],
    [navigation, dispatch, currentLanguage],
  );

  return (
    <ScreenWrapper
      paddingHorizontal={0}
      scrollEnabled={true}
      headerUnScrollable={() => <Header2 title="profileMenu.title" />}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <ImageFast
            source={
              userData.images || userData.image
                ? {uri: userData.images || userData.image}
                : Images.placeholderUser
            }
            resizeMode={'cover'}
            style={styles.icon}
          />
          <ImageFast
            source={Images.edit}
            resizeMode={'contain'}
            style={styles.icon2}
            onPress={() => navigation.navigate('EditProfile')}
          />
        </View>
        <CustomText
          fontSize={30}
          fontFamily={fonts.jakartaExtraBold}
          color={colors.textPrimary}
          textAlign={'center'}
          marginTop={10}
          label={userData.name || 'profileMenu.userNameFallback'}
          removeTranslation={Boolean(userData.name)}
        />
        <CustomText
          fontSize={16}
          fontFamily={fonts.jakartaMedium}
          color={colors.textSecondary}
          textAlign={'center'}
          marginTop={5}
          label={userData.email || 'profileMenu.userEmailFallback'}
          removeTranslation={Boolean(userData.email)}
        />
        {/* <View style={styles.proBadge}>
          <CustomText
            label="profileMenu.proMember"
            fontSize={12}
            fontFamily={fonts.jakartaBold}
            color={colors.proBadgeText}
            textAlign={'center'}
          />
        </View> */}
        {profileSections.map(section => (
          <View key={section.id}>
            <CustomText
              fontSize={14}
              fontFamily={fonts.jakartaMedium}
              color={colors.textPrimary}
              marginTop={15}
              label={section.titleKey}
            />
            <View style={styles.optionsContainer}>
              {section.items.map((item, index) => {
                const isToggleRow = item.type === 'toggle';
                const RowContainer = isToggleRow ? View : TouchableOpacity;
                const rowContainerProps = isToggleRow
                  ? {style: styles.optionItem}
                  : {
                      activeOpacity: 0.85,
                      style: styles.optionItem,
                      onPress: () => item.onPress?.(),
                    };

                return (
                <View key={item.id}>
                  <RowContainer {...rowContainerProps}>
                    <View style={styles.optionItemContainer}>
                      <ImageFast
                        source={Images[item.icon]}
                        resizeMode={'contain'}
                        style={styles.optionIcon}
                      />
                    </View>
                    <View style={styles.optionTextWrap}>
                      <CustomText
                        fontSize={14}
                        fontFamily={fonts.jakartaSemiBold}
                        color={colors.textPrimary}
                        label={item.titleKey}
                        lineHeight={20}
                      />
                      <CustomText
                        fontSize={10}
                        fontFamily={fonts.jakartaMedium}
                        color={colors.textSecondary}
                        label={item.subtitleKey}
                        lineHeight={18}
                      />
                    </View>
                    {isToggleRow && (
                      <View style={styles.switchWrap}>
                        <CustomToggle
                          value={isDarkMode}
                          onValueChange={setDarkMode}
                          trackColorOn={colors.switchTrackOn}
                          trackColorOff={colors.switchTrackOff}
                          thumbColor={colors.switchThumb}
                        />
                      </View>
                    )}
                  </RowContainer>
                  {index !== section.items.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              );
              })}
            </View>
          </View>
        ))}
      </View>
    </ScreenWrapper>
  );
};

export default Profile;

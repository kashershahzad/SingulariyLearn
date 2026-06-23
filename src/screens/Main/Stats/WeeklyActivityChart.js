import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';

const CHART_HEIGHT = 132;
const BAR_WIDTH = 40;
const ACTIVE_COLOR = '#0298EF';
const INACTIVE_BAR_COLOR = '#B8E4FF';
const INACTIVE_LABEL_COLOR = '#8B8B8B';

const EMPTY_WEEK = [
  {label: 'MON', value: 0},
  {label: 'TUE', value: 0},
  {label: 'WED', value: 0},
  {label: 'THU', value: 0},
  {label: 'FRI', value: 0},
  {label: 'SAT', value: 0},
  {label: 'SUN', value: 0},
];

const getDefaultActiveLabel = (chartData, highlightLabel) => {
  if (highlightLabel) {
    return highlightLabel;
  }
  const peak = Math.max(...chartData.map(item => Number(item.value) || 0));
  const peakItem = chartData.find(
    item => Number(item.value) === peak && peak > 0,
  );
  return peakItem?.label ?? chartData[0]?.label;
};

const WeeklyActivityChart = ({
  title,
  periodLabel,
  data = [],
  highlightLabel,
}) => {
  const {t} = useTranslation();
  const resolvedTitle = title || t('screens.stats.weeklyActivity');
  const resolvedPeriodLabel = periodLabel || t('screens.stats.thisWeek');
  const chartData = data.length ? data : EMPTY_WEEK;

  const maxValue = useMemo(() => {
    const peak = Math.max(...chartData.map(item => Number(item.value) || 0));
    return peak > 0 ? peak : 1;
  }, [chartData]);

  const [activeLabel, setActiveLabel] = useState(() =>
    getDefaultActiveLabel(chartData, highlightLabel),
  );

  useEffect(() => {
    setActiveLabel(getDefaultActiveLabel(chartData, highlightLabel));
  }, [chartData, highlightLabel]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <CustomText
          label={resolvedTitle}
          fontSize={18}
          fontFamily={fonts.jakartaBold}
          color="#1B1B24"
          lineHeight={24}
          removeTranslation
        />
        <View style={styles.periodPill}>
          <CustomText
            label={resolvedPeriodLabel}
            fontSize={11}
            fontFamily={fonts.jakartaSemiBold}
            color="#6B5B95"
            lineHeight={16}
            removeTranslation
          />
        </View>
      </View>

      <View style={styles.chartRow}>
        {chartData.map(item => {
          const value = Number(item.value) || 0;
          const isActive = item.label === activeLabel;
          const barHeight =
            value > 0 ? (value / maxValue) * CHART_HEIGHT : 0;

          return (
            <TouchableOpacity
              key={item.label}
              style={styles.barColumn}
              activeOpacity={0.85}
              onPress={() => setActiveLabel(item.label)}>
              <View style={styles.barTrack}>
                {barHeight > 0 && (
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: isActive
                          ? ACTIVE_COLOR
                          : INACTIVE_BAR_COLOR,
                      },
                    ]}
                  />
                )}
              </View>
              <CustomText
                label={item.label}
                fontSize={11}
                fontFamily={fonts.jakartaSemiBold}
                color={isActive ? ACTIVE_COLOR : INACTIVE_LABEL_COLOR}
                lineHeight={16}
                marginTop={8}
                textAlign="center"
                removeTranslation
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default WeeklyActivityChart;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E7E7',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  periodPill: {
    backgroundColor: '#EDE8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  barColumn: {
    width: BAR_WIDTH,
    alignItems: 'center',
  },
  barTrack: {
    height: CHART_HEIGHT,
    width: BAR_WIDTH,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: BAR_WIDTH,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
});

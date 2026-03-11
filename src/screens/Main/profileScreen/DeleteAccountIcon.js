import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { COLORS } from '../../../utils/COLORS';

const SIZE = 45;

const DeleteAccountIcon = () => (
  <View style={{ width: SIZE, height: SIZE }}>
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <Circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2} fill={"#76CDFF"} />
      {/* Trash icon (24x24) centered in circle */}
      <Path
        fill={'#0298EF'}
        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
        transform="translate(12.5, 12.5) scale(0.833)"
      />
    </Svg>
  </View>
);

export default DeleteAccountIcon;

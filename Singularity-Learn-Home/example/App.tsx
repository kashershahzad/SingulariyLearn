import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from '../src/HomeScreen';
import { mockCourses, mockLearners } from '../src/data/mockData';
import { ActionButton } from '../src/components/ActionButton';
import { styles } from '../src/styles';

/** Demo-only state selector. Production authentication supplies the Learner prop. */
export default function App() {
  const [state, setState] = useState<keyof typeof mockLearners>('guest');
  const [saved, setSaved] = useState<string[]>([]);
  return <SafeAreaProvider>
    <View style={{ flex: 1 }}>
      <HomeScreen learner={mockLearners[state]} courses={mockCourses} savedCourseIds={saved}
        onToggleSaved={id => setSaved(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])}
        onAction={action => Alert.alert('Demo action', JSON.stringify(action, null, 2))} />
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.row}>{(['guest', 'registered', 'enrolled'] as const).map(kind =>
        <ActionButton key={kind} label={kind} selected={state === kind} secondary={state !== kind} onPress={() => setState(kind)} />)}</SafeAreaView>
    </View>
  </SafeAreaProvider>;
}

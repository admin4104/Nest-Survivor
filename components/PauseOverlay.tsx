import { StyleSheet, Text, View } from 'react-native';
import { Button } from './ui';

interface Props {
  onResume: () => void;
  onQuit: () => void;
}

export default function PauseOverlay({ onResume, onQuit }: Props) {
  return (
    <View style={styles.backdrop}>
      <Text style={styles.title}>Paused</Text>
      <View style={styles.buttons}>
        <Button title="Resume" onPress={onResume} />
        <Button title="Quit to Menu" onPress={onQuit} variant="danger" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(2,6,23,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 24,
  },
  title: { color: '#fff', fontSize: 30, fontWeight: '900' },
  buttons: { alignSelf: 'stretch', gap: 10 },
});

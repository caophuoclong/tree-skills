import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/ui/tokens';

export default function WellbeingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mental Energy</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgBase, alignItems: 'center', justifyContent: 'center' },
  text: { color: Colors.textPrimary, fontSize: 20 },
});

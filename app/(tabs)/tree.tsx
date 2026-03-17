import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/src/ui/tokens';

export default function TreeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>Skill Tree</Text>
        <Text style={styles.sub}>Coming soon: Branch View</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgBase },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { color: Colors.textPrimary, fontSize: 20, fontWeight: '600' },
  sub: { color: Colors.textMuted, fontSize: 14, marginTop: 8 },
});

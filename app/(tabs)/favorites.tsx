import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Heart } from 'lucide-react-native';

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
      </View>
      
      <View style={styles.emptyState}>
        <Heart size={48} color={Colors.primary} />
        <Text style={styles.emptyStateText}>No favorites yet</Text>
        <Text style={styles.emptyStateSubtext}>
          Start adding perfumes to your favorites list
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  header: {
    marginTop: 60,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.7,
    textAlign: 'center',
  },
});
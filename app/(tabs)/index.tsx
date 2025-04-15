import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Star } from 'lucide-react-native';

const SAMPLE_PERFUMES = [
  {
    id: '1',
    name: 'Rose Elixir',
    brand: 'Floral Dreams',
    imageUrl: 'https://images.unsplash.com/photo-1588405748880-515d2dcf0322?w=400',
    averageRating: 4.5,
    reviewCount: 128,
  },
  {
    id: '2',
    name: 'Ocean Breeze',
    brand: 'Aqua Essence',
    imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400',
    averageRating: 4.2,
    reviewCount: 95,
  },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Fragrances</Text>
        <Text style={styles.subtitle}>Find your signature scent</Text>
      </View>

      <FlatList
        data={SAMPLE_PERFUMES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.cardContent}>
              <Text style={styles.perfumeName}>{item.name}</Text>
              <Text style={styles.brandName}>{item.brand}</Text>
              <View style={styles.ratingContainer}>
                <Star size={16} color={Colors.primary} fill={Colors.primary} />
                <Text style={styles.rating}>{item.averageRating}</Text>
                <Text style={styles.reviews}>({item.reviewCount} reviews)</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text,
    opacity: 0.7,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 16,
  },
  perfumeName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.7,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 4,
  },
  reviews: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.7,
    marginLeft: 4,
  },
});
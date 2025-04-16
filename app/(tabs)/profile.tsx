import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Settings, Star, BookOpen } from 'lucide-react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <Image
            source={require('@/assets/images/val-pic.png')}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Valtrizt Khalifah</Text>
            <Text style={styles.profileBio}>Fragrance Enthusiast</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>42</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>16</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <BookOpen size={24} color={Colors.text} />
          <Text style={styles.menuText}>My Reviews</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Star size={24} color={Colors.text} />
          <Text style={styles.menuText}>Wishlist</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    padding: 16,
    paddingTop: 60,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
  },
  profileBio: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.7,
  },
  settingsButton: {
    padding: 8,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 16,
    marginTop: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.7,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  menuSection: {
    backgroundColor: Colors.white,
    marginTop: 16,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
});
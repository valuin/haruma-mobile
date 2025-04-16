import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Star } from "lucide-react-native";
import { Colors } from "@/constants/Colors";

// Define the type for the perfume data
export interface Perfume {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  averageRating: number;
  reviewCount: number;
}

interface PerfumeCardProps {
  perfume: Perfume;
  onPress: () => void; // Callback for when the card is pressed
}

const PerfumeCard: React.FC<PerfumeCardProps> = ({ perfume, onPress }) => {
  return (
    <TouchableOpacity
      className="flex-row bg-white rounded-lg mb-4 overflow-hidden shadow-md border border-gray-100"
      onPress={onPress} // Use the passed onPress handler
    >
      <Image
        source={{ uri: perfume.imageUrl }}
        className="w-24 h-full" // Ensure image takes appropriate height or set fixed height
        resizeMode="cover"
      />
      <View className="flex-1 p-4 justify-center">
        <Text
          className="text-lg font-semibold text-gray-800 mb-1"
          numberOfLines={1}
        >
          {perfume.name}
        </Text>
        <Text className="text-sm text-gray-500 mb-2">{perfume.brand}</Text>
        {/* Rating */}
        <View className="flex-row items-center mt-1">
          <Star size={16} color={Colors.primary} fill={Colors.primary} />
          <Text className="ml-1 font-semibold text-gray-700">
            {perfume.averageRating.toFixed(1)}
          </Text>
          <Text className="ml-1 text-xs text-gray-500">
            ({perfume.reviewCount} reviews)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PerfumeCard;

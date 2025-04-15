export interface Perfume {
  id: string;
  name: string;
  brand: string;
  description: string;
  imageUrl: string;
  notes: string[];
  averageRating: number;
  reviewCount: number;
}

export interface Review {
  id: string;
  perfumeId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
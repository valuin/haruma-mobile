export interface Perfume {
  id: string;
  name: string;

  brand: string;

  description: string;
  image_url: string;
  notes: string[];

  averageRating: number;
  reviewCount: number;

  brands?: {
    name: string;
    logo_url: string;
  };
}

export interface Review {
  id: string;
  perfume_id: string; 
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

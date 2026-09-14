export interface ProductReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  verified: boolean;
  helpful: number;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

export interface ReviewSummary {
  averageRating: number;
  reviewCount: number;
}

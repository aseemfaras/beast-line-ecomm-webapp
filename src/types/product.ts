export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  status: "approved" | "pending" | "rejected";
  rejectReason?: string | null;
  images?: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  mrp: number;
  sellingPrice: number;
  discount: number;
  tax: number;
  sku: string;
  stock: number;
  minStock: number;
  category: string;
  subCategory: string;
  gender: "Men" | "Women" | "Kids" | "Unisex";
  brand: string;
  sportType: string;
  colors: string[];
  sizes: string[];
  thumbnail: string;
  gallery: string[];
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  rating: number;
  featured?: boolean;
  bestSeller?: boolean;
  trending?: boolean;
}

export interface ProductCardProps {
  product: Product;
}

export type CategoryOption = {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
};

export interface ProductDetailProps {
  params: Promise<{ id: string }>;
}

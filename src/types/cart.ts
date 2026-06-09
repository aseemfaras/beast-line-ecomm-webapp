import { Product } from "./product";

export interface CartItem {
  id?: number;
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  savedForLater?: boolean;
}

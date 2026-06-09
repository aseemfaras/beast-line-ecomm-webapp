export interface Coupon {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase: number;
  categoryIds?: string[];
  subcategoryIds?: string[];
  brandNames?: string[];
}

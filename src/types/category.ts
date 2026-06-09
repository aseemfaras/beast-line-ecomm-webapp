export interface Subcategory {
  id: string;
  categoryId?: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

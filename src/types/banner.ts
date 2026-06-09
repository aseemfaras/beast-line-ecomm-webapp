export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link?: string | null;
  type: string[];
  categoryIds?: string[];
  subcategoryIds?: string[];
}

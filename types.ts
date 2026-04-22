export interface Book {
  id: string;
  title: string;
  author: string;
  pages: string;
  dimensions: string; // Replaces availability
  price: string;
  selected: boolean;
  created_at?: string;
}

export interface ScannedBookData {
  title: string;
  author: string;
}
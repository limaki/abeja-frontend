import { Category } from './category.model';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: Category | string;
  active: boolean;
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
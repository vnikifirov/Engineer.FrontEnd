export interface Category {
  id: number;
  name: string;
}

export interface CategoryDto {
  name: string;
}

export interface ProductDto {
  name: string;
  price: number;
  expirationDate: string;
  categoryId: number;
}

export interface ProductDb {
  id: number;
  name: string;
  price: number;
  expirationDate: string;
  categoryId: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  expirationDate: number;
  category: Category | null;
}

export type User = {
  userId: number;
  email: string;
  password: string;
};

export interface Jwt {
  accessToken: string;
}

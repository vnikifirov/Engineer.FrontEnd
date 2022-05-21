import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, ProductDto } from '@challenge/api-interfaces';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Product[]>('/api/products');
  }

  post(body: ProductDto) {
    return this.http.post<void>('/api/products', body);
  }

  put(id: number, body: ProductDto) {
    return this.http.put<void>(`/api/products/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`/api/products/${id}`);
  }
}

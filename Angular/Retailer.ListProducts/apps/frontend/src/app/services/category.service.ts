import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category, CategoryDto } from '@challenge/api-interfaces';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Category[]>('/api/categories');
  }

  post(body: CategoryDto) {
    return this.http.post<void>('/api/categories', body);
  }

  put(id: number, body: CategoryDto) {
    return this.http.put<void>(`/api/categories/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`/api/categories/${id}`);
  }
}

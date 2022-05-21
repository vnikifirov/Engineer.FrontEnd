import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Jwt, User } from '@challenge/api-interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(body: { email: string; password: string }) {
    return this.http.post<Jwt>('/api/auth/login', body);
  }

  check() {
    return this.http.get<Partial<User>>('/api/auth/check');
  }
}

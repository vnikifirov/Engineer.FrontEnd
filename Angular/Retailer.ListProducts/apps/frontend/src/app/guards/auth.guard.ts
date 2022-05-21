import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    return this.authService.check().pipe(
      switchMap(() => of(true)),
      catchError(async () => {
        localStorage.removeItem('accessToken');
        return this.router.parseUrl('/auth');
      })
    );
  }
}

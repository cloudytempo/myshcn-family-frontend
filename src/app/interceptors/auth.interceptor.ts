import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

/**
 * HTTP Interceptor for adding auth token to requests and handling errors
 * 
 * To use this interceptor, add it to your app.config.ts:
 * 
 * import { provideHttpClient, withInterceptors } from '@angular/common/http';
 * 
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(withInterceptors([authInterceptor]))
 *   ]
 * };
 */

export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Add auth token to request headers
    const token = this.authService.getToken();
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } else {
      request = request.clone({
        setHeaders: {
          'Content-Type': 'application/json'
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized errors
        if (error.status === 401) {
          // Token expired or invalid
          this.authService.logout();
          this.router.navigate(['/login']);
        }

        // Handle 403 Forbidden errors
        if (error.status === 403) {
          console.error('Access forbidden', error);
        }

        // Handle 500 Server errors
        if (error.status === 500) {
          console.error('Server error', error);
        }

        return throwError(
          () => new Error(error.error?.message || 'An error occurred')
        );
      })
    );
  }
}

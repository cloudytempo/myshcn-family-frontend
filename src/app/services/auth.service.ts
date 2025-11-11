import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User, LoginRequest, LoginResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated$: Observable<boolean>;

  // Dummy users for demo - Replace with API call later
  private dummyUsers = [
    {
      id: '1',
      email: 'demo@example.com',
      name: 'John Doe',
      password: 'password123'
    },
    {
      id: '2',
      email: 'user@example.com',
      name: 'Jane Smith',
      password: 'password123'
    }
  ];

  constructor() {
    const storedUser = this.getStoredUser();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();

    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(!!storedUser);
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  }

  /**
   * Get current user synchronously
   */
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get current authentication status synchronously
   */
  public get isAuthenticatedValue(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Login method - Replace this with actual API call
   * @param loginRequest Login credentials
   * @returns Observable<LoginResponse>
   */
  public login(loginRequest: LoginRequest): Observable<LoginResponse> {
    // TODO: Replace with HTTP POST call to your backend
    // return this.http.post<LoginResponse>('/api/auth/login', loginRequest)
    //   .pipe(
    //     tap(response => this.handleAuthResponse(response)),
    //     catchError(error => this.handleAuthError(error))
    //   );

    // Dummy implementation for demo
    return new Observable(observer => {
      setTimeout(() => {
        const dummyUser = this.dummyUsers.find(
          u => u.email === loginRequest.email
        );

        if (dummyUser && dummyUser.password === loginRequest.password) {
          const response: LoginResponse = {
            user: {
              id: dummyUser.id,
              email: dummyUser.email,
              name: dummyUser.name,
              token: this.generateDummyToken()
            },
            token: this.generateDummyToken()
          };
          this.handleAuthResponse(response);
          observer.next(response);
          observer.complete();
        } else {
          observer.error({
            message: 'Invalid email or password'
          });
        }
      }, 500);
    });
  }

  /**
   * Register method - Prepare for API integration
   * @param user User data
   * @param password User password
   * @returns Observable<LoginResponse>
   */
  public register(
    user: Omit<User, 'id' | 'token'>,
    password: string
  ): Observable<LoginResponse> {
    // TODO: Replace with HTTP POST call to your backend
    // return this.http.post<LoginResponse>('/api/auth/register', { user, password })
    //   .pipe(
    //     tap(response => this.handleAuthResponse(response)),
    //     catchError(error => this.handleAuthError(error))
    //   );

    return of({
      user: { ...user, id: Date.now().toString() },
      token: this.generateDummyToken()
    });
  }

  /**
   * Logout method
   */
  public logout(): void {
    // TODO: Optional - Call API to invalidate token
    // this.http.post('/api/auth/logout', {}).subscribe();

    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Handle successful authentication response
   */
  private handleAuthResponse(response: LoginResponse): void {
    const userData = response.user;
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('authToken', response.token);
    this.currentUserSubject.next(userData);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Retrieve stored user from localStorage
   */
  private getStoredUser(): User | null {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  /**
   * Generate dummy token for demo purposes
   */
  private generateDummyToken(): string {
    return 'dummy_token_' + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Get auth token from storage
   */
  public getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: any): Observable<never> {
    console.error('Auth error:', error);
    throw error;
  }
}

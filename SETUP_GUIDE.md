# Setup & Integration Guide

## Post-Installation Steps

After creating this Angular Family Tree application, follow these steps to ensure everything is working correctly and to integrate with your backend API.

## 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Angular 20
- Angular Material 20
- Angular CDK
- Bootstrap 5
- RxJS 7.8
- TypeScript 5.8

## 2. Start the Development Server

```bash
npm start
```

The application will be available at `http://localhost:4200/`

### Credentials for Testing
- **Email:** demo@example.com
- **Password:** password123

## 3. Project Overview

### Key Files Created

#### Components
- `src/app/pages/login/login.component.ts` - Login page with form validation
- `src/app/pages/dashboard/dashboard.component.ts` - Main dashboard with toolbar
- `src/app/pages/family-tree/family-tree.component.ts` - Family tree visualization

#### Services
- `src/app/services/auth.service.ts` - Authentication logic with TODO markers for API integration
- `src/app/services/family.service.ts` - Family data management with API-ready templates

#### Guards & Models
- `src/app/guards/auth.guard.ts` - Route protection
- `src/app/models/user.model.ts` - User interfaces
- `src/app/models/family.model.ts` - Family tree interfaces

#### Configuration
- `src/app/app.routes.ts` - Application routing
- `src/app/app.config.ts` - App configuration with Material animations
- `src/styles.css` - Global styles with Material theme and Bootstrap

## 4. API Integration Steps

### Step 1: Add HttpClient Provider

Update `src/app/app.config.ts`:

```typescript
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient()  // Add this line
  ]
};
```

### Step 2: Update AuthService

Replace the dummy login implementation in `src/app/services/auth.service.ts`:

```typescript
import { HttpClient } from '@angular/common/http';

constructor(private http: HttpClient) {
  // ... existing code
}

public login(loginRequest: LoginRequest): Observable<LoginResponse> {
  return this.http.post<LoginResponse>('/api/auth/login', loginRequest)
    .pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => this.handleAuthError(error))
    );
}

public register(
  user: Omit<User, 'id' | 'token'>,
  password: string
): Observable<LoginResponse> {
  return this.http.post<LoginResponse>('/api/auth/register', { user, password })
    .pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => this.handleAuthError(error))
    );
}
```

### Step 3: Update FamilyService

Replace the dummy data methods in `src/app/services/family.service.ts`:

```typescript
import { HttpClient } from '@angular/common/http';

constructor(private http: HttpClient) {
  // ... existing code
}

public getFamilyTree(userId?: string): Observable<FamilyTree> {
  const url = userId ? `/api/family/${userId}` : '/api/family/me';
  return this.http.get<FamilyTree>(url);
}

public getFamilyMember(memberId: string): Observable<FamilyMember | null> {
  return this.http.get<FamilyMember>(`/api/family/member/${memberId}`);
}

public createFamilyMember(member: FamilyMember): Observable<FamilyMember> {
  return this.http.post<FamilyMember>('/api/family/member', member);
}

public updateFamilyMember(
  memberId: string,
  member: Partial<FamilyMember>
): Observable<FamilyMember> {
  return this.http.put<FamilyMember>(`/api/family/member/${memberId}`, member);
}

public deleteFamilyMember(memberId: string): Observable<void> {
  return this.http.delete<void>(`/api/family/member/${memberId}`);
}
```

### Step 4: Add Environment Configuration

Create `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};

export const environment_prod = {
  production: true,
  apiUrl: 'https://api.yourbackend.com/api'
};
```

Update services to use environment URLs:

```typescript
import { environment } from '../../../environments/environment';

public login(loginRequest: LoginRequest): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(
    `${environment.apiUrl}/auth/login`,
    loginRequest
  )
    .pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => this.handleAuthError(error))
    );
}
```

## 5. Material Theme Customization

The app includes the Indigo/Pink Material theme. To change it:

Edit `src/styles.css`:

```css
/* Available themes:
   - @angular/material/prebuilt-themes/indigo-pink.css
   - @angular/material/prebuilt-themes/deeppurple-amber.css
   - @angular/material/prebuilt-themes/purple-green.css
   - @angular/material/prebuilt-themes/pink-bluegrey.css
*/
@import '@angular/material/prebuilt-themes/deeppurple-amber.css';
```

## 6. Bootstrap Customization

Bootstrap 5 utility classes are available. Examples:

```html
<!-- Padding/Margin -->
<div class="mt-4 mb-2">Content</div>

<!-- Display -->
<div class="d-flex justify-content-center align-items-center">Content</div>

<!-- Responsive Grid -->
<div class="row">
  <div class="col-md-6">Half width on medium screens</div>
  <div class="col-md-6">Half width on medium screens</div>
</div>
```

## 7. Running Tests

```bash
npm run test
```

The test configuration is pre-configured with Karma and Jasmine.

## 8. Production Build

```bash
npm run build
```

Output will be in `dist/myshcn-family-frontend/`

### Build Optimization Tips

1. **Lazy Load Routes:**
```typescript
export const routes: Routes = [
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) }
];
```

2. **Tree Shaking:**
- Only import needed Material modules
- Use production build for optimization

3. **Performance Monitoring:**
- Use Angular DevTools
- Monitor bundle size with `ng build --stats-json`

## 9. Backend API Specification (Template)

### Authentication Endpoints

```
POST /api/auth/login
Body: { email: string, password: string }
Response: { user: User, token: string }

POST /api/auth/register
Body: { user: User, password: string }
Response: { user: User, token: string }

POST /api/auth/logout
Response: {}
```

### Family Tree Endpoints

```
GET /api/family/me (or /api/family/:userId)
Response: { rootMember: FamilyMember, members: FamilyMember[] }

GET /api/family/member/:memberId
Response: FamilyMember

POST /api/family/member
Body: FamilyMember
Response: FamilyMember

PUT /api/family/member/:memberId
Body: Partial<FamilyMember>
Response: FamilyMember

DELETE /api/family/member/:memberId
Response: {}
```

## 10. Environment Variables

Create `.env` file (requires @angular-builders/custom-webpack):

```
NG_APP_API_URL=http://localhost:3000/api
NG_APP_ENVIRONMENT=development
```

Or use Angular's built-in environment files in `src/environments/`

## 11. Troubleshooting

### Issue: Material Styles Not Loading
**Solution:** Ensure `provideAnimations()` is in `app.config.ts`

### Issue: Auth Guard Redirects Unexpectedly
**Solution:** Check localStorage for valid token and user data

### Issue: API Calls Failing
**Solution:** Verify CORS is configured on backend and API URLs are correct

### Issue: npm install Fails
**Solution:** Try `npm install --legacy-peer-deps`

## 12. Next Steps

1. ✅ Replace dummy data with real API calls
2. ✅ Add error handling and logging
3. ✅ Implement refresh token mechanism
4. ✅ Add data caching strategies
5. ✅ Set up environment-based configuration
6. ✅ Add unit and e2e tests
7. ✅ Configure CORS on backend
8. ✅ Add loading states and proper error messages
9. ✅ Implement file upload for avatars
10. ✅ Add data export/import features

## 13. Additional Resources

- [Angular Docs](https://angular.dev)
- [Angular Material](https://material.angular.io)
- [RxJS Docs](https://rxjs.dev)
- [Bootstrap Docs](https://getbootstrap.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 14. Support & Questions

For issues or questions:
1. Check the README.md
2. Review the TODO comments in service files
3. Check browser console for errors
4. Verify API endpoints are correct
5. Check CORS configuration on backend

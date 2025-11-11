# Quick Reference Guide

## 🚀 Getting Started (2 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm start

# 3. Open browser
# Navigate to http://localhost:4200

# 4. Login with demo credentials
# Email: demo@example.com
# Password: password123
```

---

## 📁 Key Files to Know

### For UI Changes
- `src/app/pages/login/login.component.html` - Login page UI
- `src/app/pages/dashboard/dashboard.component.html` - Dashboard UI
- `src/app/pages/family-tree/family-tree.component.html` - Family tree UI
- `src/styles.css` - Global styles and Material theme

### For Business Logic
- `src/app/services/auth.service.ts` - Authentication logic (TODO: Add API)
- `src/app/services/family.service.ts` - Family data logic (TODO: Add API)
- `src/app/guards/auth.guard.ts` - Route protection
- `src/app/app.routes.ts` - URL routing

### For Configuration
- `src/environments/environment.ts` - Development config
- `src/environments/environment.prod.ts` - Production config
- `src/app/app.config.ts` - Angular app setup
- `package.json` - Dependencies

---

## 🔑 Demo Credentials

```
Email: demo@example.com
Password: password123
```

Or click "Fill Demo Credentials" button on login page.

---

## 🎯 Making Changes

### Add a new page/component
```typescript
// 1. Create component file
src/app/pages/my-page/my-page.component.ts

// 2. Add to routes in src/app/app.routes.ts
{
  path: 'my-page',
  component: MyPageComponent,
  canActivate: [AuthGuard]  // Add if protected
}
```

### Call an API endpoint
```typescript
// 1. In src/app/services/your.service.ts
constructor(private http: HttpClient) { }

public getData(): Observable<Data> {
  return this.http.get<Data>('/api/endpoint');
}

// 2. In your component
constructor(private yourService: YourService) { }

ngOnInit() {
  this.yourService.getData().subscribe(data => {
    this.data = data;
  });
}
```

### Add Material component
```typescript
// 1. Import in component
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  imports: [MatButtonModule, MatCardModule]
})

// 2. Use in template
<mat-card>
  <button mat-raised-button color="primary">Click me</button>
</mat-card>
```

### Update styling
```css
/* Global styles */
src/styles.css

/* Component styles */
src/app/pages/component-name/component-name.component.css

/* Use Bootstrap classes */
<div class="container mt-4 mb-2">
  <div class="row">
    <div class="col-md-6">Half width</div>
  </div>
</div>
```

---

## 🔌 API Integration Quick Start

### Step 1: Add HttpClient
```typescript
// src/app/app.config.ts
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    provideHttpClient()
  ]
};
```

### Step 2: Replace Service Methods
```typescript
// BEFORE: src/app/services/auth.service.ts
public login(loginRequest: LoginRequest): Observable<LoginResponse> {
  // Dummy implementation
}

// AFTER: src/app/services/auth.service.ts
public login(loginRequest: LoginRequest): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(
    `${environment.apiUrl}/auth/login`,
    loginRequest
  ).pipe(
    tap(response => this.handleAuthResponse(response)),
    catchError(error => this.handleAuthError(error))
  );
}
```

### Step 3: Update API URL
```typescript
// src/environments/environment.ts
export const environment = {
  apiUrl: 'http://localhost:3000/api'  // Change to your API
};
```

---

## 🧠 Architecture Overview

```
User Interface (Components)
         ↓
    Services (RxJS Observables)
         ↓
    API Calls (HTTP Client)
         ↓
    Backend Server
         ↓
    Database
```

**Data Flow:**
1. Component displays data from Service
2. Service manages Observable streams
3. Service calls HTTP API endpoints
4. API returns data
5. Service updates Observable (BehaviorSubject)
6. Component receives updated data reactively

---

## 📊 Component Hierarchy

```
App (Root)
  ├── LoginComponent (public)
  └── DashboardComponent (protected)
      └── FamilyTreeComponent (child)
```

---

## 🛡️ Security Features

1. **AuthGuard** - Blocks unauthorized access to routes
2. **Token Storage** - JWT stored in localStorage
3. **Session Management** - Tracks login state
4. **Auto-logout** - (TODO: Add interceptor for 401 errors)
5. **Form Validation** - Client-side validation

---

## 📦 npm Commands

```bash
# Development
npm start              # Run dev server
npm run watch         # Watch mode
npm run test          # Run tests

# Production
npm run build         # Build for production

# Angular CLI
ng generate component name     # Create component
ng generate service name       # Create service
ng --help                      # See all commands
```

---

## 🎨 Material Theme Colors

**Current Theme:** Indigo/Pink

- Primary: #3f51b5
- Accent: #ff4081
- Warn: #f44336

**Change theme in src/styles.css:**
```css
@import '@angular/material/prebuilt-themes/deeppurple-amber.css';
```

---

## 🔥 Common Tasks

### Login Flow
1. User enters credentials
2. Click "Sign In"
3. Service validates and stores token
4. Redirects to /dashboard
5. AuthGuard allows access

### Display Data
```typescript
// 1. Get data from service
public data$: Observable<Data>;

constructor(private service: MyService) {
  this.data$ = this.service.getData();
}

// 2. Use in template with async pipe
<div>{{ data$ | async | json }}</div>
```

### Handle Errors
```typescript
this.service.getData().subscribe({
  next: (data) => this.data = data,
  error: (error) => this.errorMsg = error.message,
  complete: () => console.log('Done')
});
```

### Show Loading State
```typescript
ngOnInit() {
  this.loading = true;
  this.service.getData().pipe(
    finalize(() => this.loading = false)
  ).subscribe(data => this.data = data);
}
```

---

## 💡 Tips & Tricks

### Import Multiple Material Modules
```typescript
import {
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatToolbarModule
} from '@angular/material';

@Component({
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatToolbarModule
  ]
})
```

### Use RxJS with Multiple Services
```typescript
combineLatest([
  this.userService.getUser(),
  this.settingsService.getSettings()
]).pipe(
  map(([user, settings]) => ({ user, settings }))
).subscribe(data => {
  // Use combined data
});
```

### Unsubscribe Automatically
```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => this.data = data);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### Debug Observable
```typescript
this.service.getData()
  .pipe(
    tap(data => console.log('Data:', data)),
    catchError(error => {
      console.error('Error:', error);
      return of(null);
    })
  )
  .subscribe(result => this.data = result);
```

---

## 📞 Need Help?

### Check These Files First
- `README.md` - Overview and features
- `SETUP_GUIDE.md` - Detailed setup steps
- `IMPLEMENTATION_SUMMARY.md` - What was built
- Component comments - Inline explanations
- Service comments - TODO markers for API

### Common Solutions

**Material styles not showing?**
→ Check `provideAnimations()` in app.config.ts

**Login not working?**
→ Check localStorage in browser DevTools

**Routes not working?**
→ Verify paths in app.routes.ts

**API calls failing?**
→ Add `provideHttpClient()` and check console errors

**Styles conflicting?**
→ Check specificity, Bootstrap vs Material

---

## 🎓 Learning Resources

- Angular Tutorial: https://angular.dev/tutorials
- Material Design: https://material.angular.io
- RxJS Operators: https://rxjs.dev/api
- TypeScript: https://www.typescriptlang.org/docs
- Bootstrap Utilities: https://getbootstrap.com/docs

---

## 📝 Quick Checklist

- [ ] Run `npm install`
- [ ] Run `npm start`
- [ ] Test login (demo@example.com / password123)
- [ ] View family tree dashboard
- [ ] Review SETUP_GUIDE.md for API integration
- [ ] Update environment.ts with your API URL
- [ ] Replace service method implementations
- [ ] Test API endpoints
- [ ] Deploy to production

---

**Ready to start? Run `npm start` and explore!**

# MyShCN Family Frontend

A modern Angular application featuring user authentication, role-based access control, and an interactive family tree visualization with a service-oriented architecture ready for API integration.

## 🎯 Features

- **Authentication System**
  - Login page with email and password validation
  - Auth guard to protect routes
  - Session management with localStorage
  - Demo credentials for testing

- **Dashboard**
  - Protected route requiring authentication
  - User information display
  - Family tree visualization
  - Responsive layout

- **Family Tree Visualization**
  - Multi-generational family tree display
  - Members organized by generation (Grandparents → Children)
  - Member cards with avatars and relations
  - Visual hierarchy showing parent-child relationships
  - Family statistics
  - Complete member list

- **Architecture**
  - Service-oriented architecture with templates ready for API integration
  - Auth Service with BehaviorSubject for reactive updates
  - Family Service with CRUD operation templates
  - Route Guards for protection
  - Standalone components (Angular 20)
  - Reactive Forms

- **UI/UX**
  - Angular Material components with Indigo/Pink theme
  - Bootstrap utility classes for responsive design
  - Material icons and animations
  - Professional styling and gradients
  - Mobile-responsive design

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (v20 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd myshcn-family-frontend
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

Start the development server

```bash
npm start
```

Navigate to `http://localhost:4200/` in your browser.

### Demo Credentials

Use these credentials to test the application:
- **Email:** demo@example.com
- **Password:** password123

Or use the "Fill Demo Credentials" button on the login page.

## 📁 Project Structure

```
src/
├── app/
│   ├── pages/
│   │   ├── login/                 # Login component with form validation
│   │   ├── dashboard/             # Main dashboard page
│   │   └── family-tree/           # Family tree visualization
│   ├── services/
│   │   ├── auth.service.ts        # Authentication service (ready for API)
│   │   └── family.service.ts      # Family data service (ready for API)
│   ├── guards/
│   │   └── auth.guard.ts          # Route protection guard
│   ├── models/
│   │   ├── user.model.ts          # User interfaces
│   │   └── family.model.ts        # Family tree interfaces
│   ├── app.routes.ts              # Application routing
│   ├── app.config.ts              # App configuration with Material
│   └── app.ts                     # Root component
├── styles.css                     # Global styles with Material theme
├── index.html                     # HTML entry point
└── main.ts                        # Application bootstrap
```

## 🔌 Service Architecture Ready for API Integration

### AuthService
The `AuthService` includes methods with TODO comments for API integration:

```typescript
// Current implementation uses dummy data
// Replace with HTTP calls:
public login(loginRequest: LoginRequest): Observable<LoginResponse>
public register(user, password): Observable<LoginResponse>
public logout(): void
public getToken(): string | null
```

**Integration Steps:**
1. Inject `HttpClient` into `AuthService`
2. Replace dummy implementations with HTTP calls
3. Update API endpoints as needed

### FamilyService
The `FamilyService` includes templates for CRUD operations:

```typescript
// Ready for API integration:
public getFamilyTree(userId?: string): Observable<FamilyTree>
public getFamilyMember(memberId: string): Observable<FamilyMember>
public createFamilyMember(member: FamilyMember): Observable<FamilyMember>
public updateFamilyMember(memberId, member): Observable<FamilyMember>
public deleteFamilyMember(memberId: string): Observable<void>
```

## 🎨 Technologies Used

- **Angular 20** - Frontend framework
- **Angular Material** - UI component library with Indigo/Pink theme
- **Bootstrap 5** - Responsive grid and utilities
- **RxJS** - Reactive programming library
- **TypeScript** - Programming language
- **Angular Forms** - Reactive forms validation

## 🔐 Authentication Flow

1. User navigates to `/login`
2. User enters credentials
3. `AuthService.login()` validates and stores token/user in localStorage
4. User is redirected to `/dashboard`
5. `AuthGuard` checks authentication status on route access
6. If not authenticated, user is redirected to `/login`

## 📊 Family Tree Data Structure

The family tree is organized hierarchically:

```
Generation 0: Grandparents
Generation 1: Parents, Aunts, Uncles
Generation 2: You, Siblings, Cousins
Generation 3: Children
Generation 4: Grandchildren
```

Each member has:
- `id`: Unique identifier
- `name`: Full name
- `relation`: Relationship type
- `generation`: Hierarchical level
- `parentId`: Parent member ID
- `children`: Array of children
- `birthDate`: Optional birth date
- `avatar`: Optional avatar URL

## 🛠️ Development Commands

```bash
# Development server
npm start

# Build for production
npm run build

# Run tests
npm run test

# Watch mode
npm run watch
```

## 🚀 Deployment

To deploy to production:

1. Build the project:
```bash
ng build --configuration production
```

2. The production build artifacts will be stored in the `dist/myshcn-family-frontend` directory.

3. Deploy the `dist/myshcn-family-frontend` folder to your hosting service.

## 📝 Adding API Integration

### Step 1: Update package.json
Ensure `@angular/platform-browser` is imported with HttpClientModule

### Step 2: Update app.config.ts
Add HTTP provider:
```typescript
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    provideHttpClient()
  ]
};
```

### Step 3: Update Services
Replace dummy implementations with HTTP calls:

```typescript
constructor(private http: HttpClient) { }

public login(loginRequest: LoginRequest): Observable<LoginResponse> {
  return this.http.post<LoginResponse>('/api/auth/login', loginRequest)
    .pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => this.handleAuthError(error))
    );
}
```

## 📄 License

This project is licensed under the MIT License.

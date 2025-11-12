# API Integration Guide

This guide explains how to integrate your Angular frontend with your backend API.

## Database Schema & Models

Your backend uses the following tables (as per your SQL schema):

### 1. **persons** table
Stores individual family members.

```sql
CREATE TABLE persons (
  id BIGINT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT DEFAULT 'UNKNOWN',
  date_of_birth DATE,
  date_of_death DATE,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ
);
```

### 2. **relationships** table
Stores spouse/partner relationships.

```sql
CREATE TABLE relationships (
  id BIGINT PRIMARY KEY,
  person1_id BIGINT REFERENCES persons(id),
  person2_id BIGINT REFERENCES persons(id),
  type TEXT DEFAULT 'PARTNERED',
  start_date_year INT,
  end_date_year INT,
  created_at TIMESTAMPTZ
);
```

### 3. **parent_child** table
Stores parent-child relationships (biological, adoptive, etc.).

```sql
CREATE TABLE parent_child (
  id BIGINT PRIMARY KEY,
  parent_id BIGINT REFERENCES persons(id),
  child_id BIGINT REFERENCES persons(id),
  type TEXT DEFAULT 'BIOLOGICAL',
  created_at TIMESTAMPTZ
);
```

## Frontend Models

The frontend TypeScript models in `src/app/models/family.model.ts` map to your database schema:

- **Person** - Maps to `persons` table
- **Relationship** - Maps to `relationships` table
- **ParentChild** - Maps to `parent_child` table
- **FamilyMember** - Extended Person with computed generation & relationships (for UI display)
- **FamilyTree** - Collection of FamilyMembers with a root member

## API Endpoints Required

Your backend should provide these RESTful endpoints:

### Get All Persons
```
GET /api/persons
Response: Person[]
```

### Get All Relationships
```
GET /api/relationships
Response: Relationship[]
```

### Get All Parent-Child Links
```
GET /api/parent-child
Response: ParentChild[]
```

### Get Complete Family Tree (Recommended)
```
GET /api/family-tree
Response: {
  persons: Person[],
  relationships: Relationship[],
  parent_child: ParentChild[]
}
```

### Create Person
```
POST /api/persons
Body: Omit<Person, 'id' | 'created_at'>
Response: Person
```

Example Request Body:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "gender": "MALE",
  "date_of_birth": "1990-05-15",
  "notes": "Software engineer",
  "photo_url": "https://example.com/john.jpg"
}
```

### Update Person
```
PUT /api/persons/:personId
Body: Partial<Omit<Person, 'id' | 'created_at'>>
Response: Person
```

### Delete Person
```
DELETE /api/persons/:personId
Response: void
```

### Create Parent-Child Link
```
POST /api/parent-child
Body: {
  parent_id: number,
  child_id: number,
  type: 'BIOLOGICAL' | 'ADOPTIVE' | 'STEP' | 'FOSTER' | 'UNKNOWN'
}
Response: ParentChild
```

### Create Relationship (Spouse)
```
POST /api/relationships
Body: {
  person1_id: number,
  person2_id: number,
  type: 'MARRIED' | 'DIVORCED' | 'PARTNERED' | 'SEPARATED' | 'WIDOWED'
}
Response: Relationship
```

## Service Integration

The `FamilyService` in `src/app/services/family.service.ts` is already configured to make these API calls.

### Configuration

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // Update to your backend URL
  appName: 'MyShCN Family Tree',
  appVersion: '1.0.0'
};
```

Update `src/environments/environment.prod.ts` for production:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://myshcn-family-backend.onrender.com/api', // Your production URL
  appName: 'MyShCN Family Tree',
  appVersion: '1.0.0'
};
```

### Available Service Methods

```typescript
// Get complete family tree (recommended)
getFamilyTree(): Observable<FamilyTree>

// Get individual endpoints
getAllPersons(): Observable<Person[]>
getAllRelationships(): Observable<Relationship[]>
getAllParentChildLinks(): Observable<ParentChild[]>

// Create/Update/Delete persons
createPerson(person: Omit<Person, 'id' | 'created_at'>): Observable<Person>
updatePerson(personId: number, updates: Partial<Omit<Person, 'id' | 'created_at'>>): Observable<Person>
deletePerson(personId: number): Observable<void>

// Create relationships
createParentChildLink(parentId: number, childId: number, type?: string): Observable<ParentChild>
createRelationship(person1Id: number, person2Id: number, type?: string): Observable<Relationship>
```

## How Components Use the Service

### Dashboard Component
```typescript
ngOnInit() {
  this.loadFamilyTree(); // Calls familyService.getFamilyTree()
}
```

### Family Tree Component
```typescript
ngOnInit() {
  // Subscribes to familyService.familyTree$ Observable
  this.familyService.familyTree$.subscribe(tree => {
    if (tree) {
      this.familyTree = tree;
      this.groupMembersByGeneration();
    }
  });
}

// When adding a new person
createPerson(personData: Person) {
  this.familyService.createPerson(personData).subscribe(created => {
    // Refreshes family tree after successful creation
    this.familyService.getFamilyTree().subscribe();
  });
}
```

### Family Member Dialog Component
```typescript
save() {
  const payload: Omit<Person, 'id' | 'created_at'> = {
    first_name: this.form.value.first_name,
    last_name: this.form.value.last_name,
    gender: this.form.value.gender,
    // ... other fields
  };

  this.familyService.createPerson(payload).subscribe(created => {
    this.dialogRef.close({ action: 'created', member: created });
  });
}
```

## Error Handling

All service methods include error handling with `catchError`:

```typescript
return this.http.get<FamilyTree>(`${this.apiUrl}/family-tree`)
  .pipe(
    map(data => this.buildFamilyTree(...)),
    catchError(err => {
      console.error('❌ Error fetching family tree:', err);
      // Fall back to dummy data
      const dummyTree = this.getDummyFamilyTree();
      this.familyTreeSubject.next(dummyTree);
      return of(dummyTree);
    })
  );
```

## Fallback to Dummy Data

If your API is unavailable, the frontend automatically falls back to dummy data (3 generations of sample families). This is useful for:
- Development/testing before backend is ready
- Offline demonstration
- Progressive enhancement

The dummy data is generated by `getDummyFamilyTree()` method in `FamilyService`.

## CORS & Authentication

### CORS (Cross-Origin Resource Sharing)
If your frontend and backend are on different domains, ensure your backend allows CORS:

```typescript
// Example: Express.js backend
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
```

### Authentication Interceptor
The `AuthInterceptor` in `src/app/interceptors/auth.interceptor.ts` is configured to add auth tokens to API requests:

To enable it in `app.config.ts`:

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

## Testing

To test the API integration:

1. **Start your backend** (ensure it's running on the configured `apiUrl`)
2. **Update environment files** with your backend URL
3. **Run the frontend**:
   ```bash
   npm start
   ```
4. **Open browser** and check:
   - Dashboard loads with family tree data
   - Network tab shows API calls to your backend
   - Browser console shows success messages (✅)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 - API endpoint not found | Check `apiUrl` in environment files matches your backend |
| 401 - Unauthorized | Ensure auth token is being sent (check AuthInterceptor is enabled) |
| CORS error | Enable CORS on your backend |
| Family tree not loading | Check Network tab for failed requests; fallback dummy data will be used |
| UI displays old data | Call `getFamilyTree()` to refresh after mutations |

## Next Steps

1. Deploy your backend API (Render, Vercel, AWS, etc.)
2. Update environment URLs to production backend
3. Test API integration end-to-end
4. Add unit tests for API integration
5. Set up error monitoring (Sentry, LogRocket, etc.)

---

**Backend repository:** [myshcn-family-backend](https://github.com/cloudytempo/myshcn-family-backend)

**API URL:** https://myshcn-family-backend.onrender.com/api

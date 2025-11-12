import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  FamilyTree,
  FamilyMember,
  Person,
  Relationship,
  ParentChild
} from '../models/family.model';

@Injectable({
  providedIn: 'root'
})
export class FamilyService {
  private familyTreeSubject: BehaviorSubject<FamilyTree | null>;
  public familyTree$: Observable<FamilyTree | null>;

  private apiUrl = environment.apiUrl || '/api';

  constructor(private http: HttpClient) {
    this.familyTreeSubject = new BehaviorSubject<FamilyTree | null>(null);
    this.familyTree$ = this.familyTreeSubject.asObservable();
  }

  /**
   * Get all persons from API
   * @returns Observable<Person[]>
   */
  public getAllPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.apiUrl}/persons`)
      .pipe(
        tap(data => {
          console.log('✅ Success: Fetched persons', data);
        }),
        catchError(err => {
          console.error('❌ Error fetching persons:', err);
          return of([]);
        })
      );
  }

  /**
   * Get all relationships (spouses/partners)
   * @returns Observable<Relationship[]>
   */
  public getAllRelationships(): Observable<Relationship[]> {
    return this.http.get<Relationship[]>(`${this.apiUrl}/relationships`)
      .pipe(
        tap(data => {
          console.log('✅ Success: Fetched relationships', data);
        }),
        catchError(err => {
          console.error('❌ Error fetching relationships:', err);
          return of([]);
        })
      );
  }

  /**
   * Get all parent-child links
   * @returns Observable<ParentChild[]>
   */
  public getAllParentChildLinks(): Observable<ParentChild[]> {
    return this.http.get<ParentChild[]>(`${this.apiUrl}/parent-child`)
      .pipe(
        tap(data => {
          console.log('✅ Success: Fetched links', data);
        }),
        catchError(err => {
          console.error('❌ Error fetching parent-child links:', err);
          return of([]);
        })
      );
  }

  /**
   * Build complete family tree by fetching data from three separate API endpoints
   * Fetches: /persons, /relationships, /parent-child
   * Expected hierarchy:
   *   Robert Smith (id: 1) → James Smith (id: 3) → David Smith (id: 5)
   *                                                  ├─ Emma Smith (id: 7)
   *                                                  └─ Liam Smith (id: 8)
   * @returns Observable<FamilyTree>
   */
  public getFamilyTree(): Observable<FamilyTree> {
    return forkJoin({
      persons: this.getAllPersons(),
      relationships: this.getAllRelationships(),
      parentChild: this.getAllParentChildLinks()
    }).pipe(
      map(data => {
        console.log('📦 Combining data to build family tree:', data);
        const tree = this.buildFamilyTree(
          data.persons || [],
          data.relationships || [],
          data.parentChild || []
        );
        this.familyTreeSubject.next(tree);
        console.log('✅ Family tree built successfully from API:', tree);
        return tree;
      }),
      catchError(err => {
        console.error('❌ Error fetching family tree from API:', err);
        // Fall back to dummy data
        const dummyTree = this.getDummyFamilyTree();
        this.familyTreeSubject.next(dummyTree);
        console.log('✅ Using dummy data fallback:', dummyTree);
        return of(dummyTree);
      })
    );
  }

  /**
   * Construct FamilyTree from API responses
   * Calculates generation levels and relationships
   */
  private buildFamilyTree(
    persons: Person[],
    relationships: Relationship[],
    parentChildLinks: ParentChild[]
  ): FamilyTree {
    if (!persons || persons.length === 0) {
      return { rootMember: null, members: [] };
    }

    // Map persons to FamilyMembers
    const memberMap = new Map<number, FamilyMember>();
    persons.forEach(person => {
      const member: FamilyMember = {
        id: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        gender: person.gender,
        dateOfBirth: person.dateOfBirth,
        dateOfDeath: person.dateOfDeath,
        notes: person.notes,
        photoUrl: person.photoUrl,
        parents: [],
        children: [],
        generation: 0
      };
      memberMap.set(person.id, member);
    });

    // Build parent-child relationships
    parentChildLinks.forEach(link => {
      const parent = memberMap.get(link.parentId);
      const child = memberMap.get(link.childId);
      if (parent && child) {
        if (!parent.children) parent.children = [];
        if (!child.parents) child.parents = [];
        parent.children!.push(link.childId);
        child.parents!.push(link.parentId);
      }
    });

    // Build spouse relationships
    relationships.forEach(rel => {
      const person1 = memberMap.get(rel.person1Id);
      const person2 = memberMap.get(rel.person2Id);
      if (person1 && person2) {
        person1.spouse_id = rel.person2Id;
        person2.spouse_id = rel.person1Id;
      }
    });

    // Calculate generation levels
    this.calculateGenerations(memberMap);

    // Find root member (oldest ancestor)
    let rootMember: FamilyMember | null = null;
    let lowestGeneration = Infinity;
    memberMap.forEach(member => {
      if (member.generation !== undefined && member.generation < lowestGeneration) {
        lowestGeneration = member.generation;
        rootMember = member;
      }
    });

    return {
      rootMember: rootMember,
      members: Array.from(memberMap.values())
    };
  }

  /**
   * Calculate generation level for each member
   * Generation 0 = oldest ancestors, 1 = their children, etc.
   */
  private calculateGenerations(memberMap: Map<number, FamilyMember>): void {
    const visited = new Set<number>();

    const traverse = (personId: number, gen: number) => {
      if (visited.has(personId)) return;
      visited.add(personId);

      const member = memberMap.get(personId);
      if (!member) return;

      // Set generation to the minimum (oldest)
      if (member.generation === undefined || member.generation > gen) {
        member.generation = gen;
      }

      // Traverse children
      if (member.children) {
        member.children.forEach(childId => {
          traverse(childId, gen + 1);
        });
      }
    };

    // Start from all members with no parents (roots)
    memberMap.forEach((member, personId) => {
      if (!member.parents || member.parents.length === 0) {
        traverse(personId, 0);
      }
    });

    // For any remaining members, assign based on parents
    memberMap.forEach((member, personId) => {
      if (member.generation === undefined) {
        if (member.parents && member.parents.length > 0) {
          const parentGen = memberMap.get(member.parents[0])?.generation ?? 0;
          member.generation = parentGen + 1;
        } else {
          member.generation = 0;
        }
      }
    });
  }

  /**
   * Create new person
   * @param person Person data
   * @returns Observable<Person>
   */
  public createPerson(person: Omit<Person, 'id' | 'created_at'>): Observable<Person> {
    return this.http.post<Person>(`${this.apiUrl}/persons`, person)
      .pipe(
        tap(created => {
          console.log('✅ Person created:', created);
          // Refresh family tree
          this.getFamilyTree().subscribe();
        }),
        catchError(err => {
          console.error('❌ Error creating person:', err);
          throw err;
        })
      );
  }

  /**
   * Update person
   * @param personId Person ID
   * @param updates Partial person data
   * @returns Observable<Person>
   */
  public updatePerson(
    personId: number,
    updates: Partial<Omit<Person, 'id' | 'created_at'>>
  ): Observable<Person> {
    return this.http.put<Person>(`${this.apiUrl}/persons/${personId}`, updates)
      .pipe(
        tap(updated => {
          console.log('✅ Person updated:', updated);
          this.getFamilyTree().subscribe();
        }),
        catchError(err => {
          console.error('❌ Error updating person:', err);
          throw err;
        })
      );
  }

  /**
   * Delete person
   * @param personId Person ID
   * @returns Observable<void>
   */
  public deletePerson(personId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/persons/${personId}`)
      .pipe(
        tap(() => {
          console.log('✅ Person deleted');
          this.getFamilyTree().subscribe();
        }),
        catchError(err => {
          console.error('❌ Error deleting person:', err);
          throw err;
        })
      );
  }

  /**
   * Create parent-child relationship
   * @param parentId Parent person ID
   * @param childId Child person ID
   * @param type Relationship type
   * @returns Observable<ParentChild>
   */
  public createParentChildLink(
    parentId: number,
    childId: number,
    type: 'BIOLOGICAL' | 'ADOPTIVE' | 'STEP' | 'FOSTER' | 'UNKNOWN' = 'BIOLOGICAL'
  ): Observable<ParentChild> {
    const payload = { parentId: parentId, childId: childId, type };
    return this.http.post<ParentChild>(`${this.apiUrl}/parent-child`, payload)
      .pipe(
        tap(created => {
          console.log('✅ Parent-child link created:', created);
          this.getFamilyTree().subscribe();
        }),
        catchError(err => {
          console.error('❌ Error creating parent-child link:', err);
          throw err;
        })
      );
  }

  /**
   * Create relationship (spouse/partner)
   * @param person1Id First person ID
   * @param person2Id Second person ID
   * @param type Relationship type
   * @returns Observable<Relationship>
   */
  public createRelationship(
    person1Id: number,
    person2Id: number,
    type: 'MARRIED' | 'DIVORCED' | 'PARTNERED' | 'SEPARATED' | 'WIDOWED' = 'PARTNERED'
  ): Observable<Relationship> {
    const payload = { person1Id: person1Id, person2Id: person2Id, type };
    return this.http.post<Relationship>(`${this.apiUrl}/relationships`, payload)
      .pipe(
        tap(created => {
          console.log('✅ Relationship created:', created);
          this.getFamilyTree().subscribe();
        }),
        catchError(err => {
          console.error('❌ Error creating relationship:', err);
          throw err;
        })
      );
  }

  /**
   * Get dummy family tree for offline/prototyping
   * Hierarchy:
   *   Robert Smith (id: 1) → James Smith (id: 3) → David Smith (id: 5)
   *                                                  ├─ Emma Smith (id: 7)
   *                                                  └─ Liam Smith (id: 8)
   *   Mary Johnson (id: 2) [spouse of Robert]
   *   Susan Miller (id: 4) [spouse of James]
   *   Alex Rivera (id: 6) [spouse of David]
   */
  private getDummyFamilyTree(): FamilyTree {
    const persons: Person[] = [
      // Generation 0: Grandparents
      {
        id: 1,
        firstName: 'Robert',
        lastName: 'Smith',
        gender: 'MALE',
        dateOfBirth: '1920-03-15',
        dateOfDeath: '2005-08-22',
        notes: 'WWII veteran, founder of family',
        photoUrl: 'https://i.pravatar.cc/150?img=1'
      },
      {
        id: 2,
        firstName: 'Mary',
        lastName: 'Johnson',
        gender: 'FEMALE',
        dateOfBirth: '1922-11-04',
        dateOfDeath: '2010-02-17',
        notes: 'School teacher',
        photoUrl: 'https://i.pravatar.cc/150?img=2'
      },

      // Generation 1: Parents
      {
        id: 3,
        firstName: 'James',
        lastName: 'Smith',
        gender: 'MALE',
        dateOfBirth: '1950-07-30',
        notes: 'Engineer, son of Robert & Mary',
        photoUrl: 'https://i.pravatar.cc/150?img=3'
      },
      {
        id: 4,
        firstName: 'Susan',
        lastName: 'Miller',
        gender: 'FEMALE',
        dateOfBirth: '1953-09-12',
        notes: 'Doctor, spouse of James',
        photoUrl: 'https://i.pravatar.cc/150?img=4'
      },

      // Generation 2: Current generation (You)
      {
        id: 5,
        firstName: 'David',
        lastName: 'Smith',
        gender: 'MALE',
        dateOfBirth: '1985-04-03',
        notes: 'Software developer, son of James & Susan',
        photoUrl: 'https://i.pravatar.cc/150?img=7'
      },
      {
        id: 6,
        firstName: 'Alex',
        lastName: 'Rivera',
        gender: 'NON_BINARY',
        dateOfBirth: '1987-12-25',
        notes: 'Artist, spouse of David',
        photoUrl: 'https://i.pravatar.cc/150?img=5'
      },

      // Generation 3: Children
      {
        id: 7,
        firstName: 'Emma',
        lastName: 'Smith',
        gender: 'FEMALE',
        dateOfBirth: '2015-06-10',
        notes: 'Daughter of David & Alex, loves dinosaurs'
      },
      {
        id: 8,
        firstName: 'Liam',
        lastName: 'Smith',
        gender: 'MALE',
        dateOfBirth: '2018-02-14',
        notes: 'Son of David & Alex, future astronaut'
      }
    ];

    const relationships: Relationship[] = [
      // Spouses
      { id: 1, person1Id: 1, person2Id: 2, type: 'MARRIED', startDateYear: 1945 },
      { id: 2, person1Id: 3, person2Id: 4, type: 'MARRIED', startDateYear: 1978 },
      { id: 3, person1Id: 5, person2Id: 6, type: 'PARTNERED', startDateYear: 2012 }
    ];

    const parentChildLinks: ParentChild[] = [
      // Generation 0 → 1: Robert & Mary → James
      { id: 1, parentId: 1, childId: 3, type: 'BIOLOGICAL' },
      { id: 2, parentId: 2, childId: 3, type: 'BIOLOGICAL' },

      // Generation 1 → 2: James & Susan → David
      { id: 3, parentId: 3, childId: 5, type: 'BIOLOGICAL' },
      { id: 4, parentId: 4, childId: 5, type: 'BIOLOGICAL' },

      // Generation 2 → 3: David & Alex → Emma & Liam
      { id: 5, parentId: 5, childId: 7, type: 'BIOLOGICAL' },
      { id: 6, parentId: 6, childId: 7, type: 'BIOLOGICAL' },
      { id: 7, parentId: 5, childId: 8, type: 'BIOLOGICAL' },
      { id: 8, parentId: 6, childId: 8, type: 'BIOLOGICAL' }
    ];

    return this.buildFamilyTree(persons, relationships, parentChildLinks);
  }

  /**
   * Set current family tree (for testing/offline scenarios)
   */
  public setFamilyTree(tree: FamilyTree): void {
    this.familyTreeSubject.next(tree);
  }

  /**
   * Get current family tree synchronously
   */
  public get currentFamilyTree(): FamilyTree | null {
    return this.familyTreeSubject.value;
  }
}

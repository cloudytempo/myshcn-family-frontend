import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { FamilyTree, FamilyMember } from '../models/family.model';

@Injectable({
  providedIn: 'root'
})
export class FamilyService {
  private familyTreeSubject: BehaviorSubject<FamilyTree | null>;
  public familyTree$: Observable<FamilyTree | null>;

  constructor() {
    this.familyTreeSubject = new BehaviorSubject<FamilyTree | null>(null);
    this.familyTree$ = this.familyTreeSubject.asObservable();
  }

  /**
   * Get family tree - Replace with actual API call
   * @param userId Optional user ID to fetch their family tree
   * @returns Observable<FamilyTree>
   */
  public getFamilyTree(userId?: string): Observable<FamilyTree> {
    // TODO: Replace with HTTP GET call to your backend
    // return this.http.get<FamilyTree>(`/api/family/${userId || 'me'}`);

    // Return dummy data for demo
    return of(this.getDummyFamilyTree());
  }

  /**
   * Get specific family member
   * @param memberId Family member ID
   * @returns Observable<FamilyMember>
   */
  public getFamilyMember(memberId: string): Observable<FamilyMember | null> {
    // TODO: Replace with HTTP GET call to your backend
    // return this.http.get<FamilyMember>(`/api/family/member/${memberId}`);

    return of(this.findMemberInDummyTree(memberId));
  }

  /**
   * Create new family member - Prepare for API integration
   * @param member Family member data
   * @returns Observable<FamilyMember>
   */
  public createFamilyMember(member: FamilyMember): Observable<FamilyMember> {
    // TODO: Replace with HTTP POST call to your backend
    // return this.http.post<FamilyMember>('/api/family/member', member);

    return of({
      ...member,
      id: Date.now().toString()
    });
  }

  /**
   * Update family member - Prepare for API integration
   * @param memberId Member ID
   * @param member Updated member data
   * @returns Observable<FamilyMember>
   */
  public updateFamilyMember(
    memberId: string,
    member: Partial<FamilyMember>
  ): Observable<FamilyMember> {
    // TODO: Replace with HTTP PUT call to your backend
    // return this.http.put<FamilyMember>(`/api/family/member/${memberId}`, member);

    return of({ ...member, id: memberId } as FamilyMember);
  }

  /**
   * Delete family member - Prepare for API integration
   * @param memberId Member ID
   * @returns Observable<void>
   */
  public deleteFamilyMember(memberId: string): Observable<void> {
    // TODO: Replace with HTTP DELETE call to your backend
    // return this.http.delete<void>(`/api/family/member/${memberId}`);

    return of(void 0);
  }

  /**
   * Get dummy family tree data for demonstration
   */
  private getDummyFamilyTree(): FamilyTree {
    const grandfather: FamilyMember = {
      id: '1',
      name: 'George Johnson Sr.',
      relation: 'Grandfather',
      generation: 0,
      birthDate: '1945-03-15',
      avatar: 'https://i.pravatar.cc/150?img=1'
    };

    const grandmother: FamilyMember = {
      id: '2',
      name: 'Margaret Johnson',
      relation: 'Grandmother',
      generation: 0,
      birthDate: '1948-07-22',
      avatar: 'https://i.pravatar.cc/150?img=2'
    };

    const father: FamilyMember = {
      id: '3',
      name: 'Robert Johnson',
      relation: 'Father',
      generation: 1,
      parentId: '1',
      birthDate: '1970-05-10',
      avatar: 'https://i.pravatar.cc/150?img=3'
    };

    const mother: FamilyMember = {
      id: '4',
      name: 'Susan Johnson',
      relation: 'Mother',
      generation: 1,
      parentId: '2',
      birthDate: '1972-11-03',
      avatar: 'https://i.pravatar.cc/150?img=4'
    };

    const uncle: FamilyMember = {
      id: '5',
      name: 'Michael Johnson',
      relation: 'Uncle',
      generation: 1,
      parentId: '1',
      birthDate: '1975-02-14',
      avatar: 'https://i.pravatar.cc/150?img=5'
    };

    const aunt: FamilyMember = {
      id: '6',
      name: 'Jennifer Johnson',
      relation: 'Aunt',
      generation: 1,
      parentId: '2',
      birthDate: '1973-08-25',
      avatar: 'https://i.pravatar.cc/150?img=6'
    };

    const user: FamilyMember = {
      id: '7',
      name: 'David Johnson',
      relation: 'You',
      generation: 2,
      parentId: '3',
      birthDate: '1995-12-20',
      avatar: 'https://i.pravatar.cc/150?img=7'
    };

    const sibling: FamilyMember = {
      id: '8',
      name: 'Emily Johnson',
      relation: 'Sister',
      generation: 2,
      parentId: '3',
      birthDate: '1998-06-08',
      avatar: 'https://i.pravatar.cc/150?img=8'
    };

    const cousin1: FamilyMember = {
      id: '9',
      name: 'Thomas Johnson',
      relation: 'Cousin',
      generation: 2,
      parentId: '5',
      birthDate: '1997-09-12',
      avatar: 'https://i.pravatar.cc/150?img=9'
    };

    const cousin2: FamilyMember = {
      id: '10',
      name: 'Sarah Johnson',
      relation: 'Cousin',
      generation: 2,
      parentId: '5',
      birthDate: '2000-01-30',
      avatar: 'https://i.pravatar.cc/150?img=10'
    };

    const child1: FamilyMember = {
      id: '11',
      name: 'Lucas Johnson',
      relation: 'Son',
      generation: 3,
      parentId: '7',
      birthDate: '2022-04-15',
      avatar: 'https://i.pravatar.cc/150?img=11'
    };

    const child2: FamilyMember = {
      id: '12',
      name: 'Olivia Johnson',
      relation: 'Daughter',
      generation: 3,
      parentId: '7',
      birthDate: '2023-10-22',
      avatar: 'https://i.pravatar.cc/150?img=12'
    };

    // Set children arrays
    grandfather.children = [father, uncle];
    grandmother.children = [mother, aunt];
    father.children = [user, sibling];
    mother.children = [user, sibling];
    uncle.children = [cousin1, cousin2];
    user.children = [child1, child2];

    const members = [
      grandfather,
      grandmother,
      father,
      mother,
      uncle,
      aunt,
      user,
      sibling,
      cousin1,
      cousin2,
      child1,
      child2
    ];

    return {
      rootMember: grandfather,
      members: members
    };
  }

  /**
   * Find a member in dummy tree by ID
   */
  private findMemberInDummyTree(memberId: string): FamilyMember | null {
    const tree = this.getDummyFamilyTree();
    return (
      tree.members.find(m => m.id === memberId) || null
    );
  }

  /**
   * Set current family tree
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

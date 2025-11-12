/**
 * Person entity from backend database
 * Maps to 'persons' table in Supabase/PostgreSQL
 */
export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  gender?: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'UNKNOWN';
  dateOfBirth?: string; // ISO date string
  dateOfDeath?: string; // ISO date string
  notes?: string;
  photoUrl?: string;
  createdAt?: string;
}

/**
 * Relationship entity (spouse/partner)
 * Maps to 'relationships' table in Supabase/PostgreSQL
 */
export interface Relationship {
  id: number;
  person1Id: number;
  person2Id: number;
  type: 'MARRIED' | 'DIVORCED' | 'PARTNERED' | 'SEPARATED' | 'WIDOWED';
  startDateYear?: number;
  endDateYear?: number;
  createdAt?: string;
}

/**
 * Parent-Child relationship entity
 * Maps to 'parent_child' table in Supabase/PostgreSQL
 */
export interface ParentChild {
  id: number;
  parentId: number;
  childId: number;
  type: 'BIOLOGICAL' | 'ADOPTIVE' | 'STEP' | 'FOSTER' | 'UNKNOWN';
  createdAt?: string;
}

/**
 * FamilyMember: Extended Person with computed family relationships and UI metadata
 * Built from Person + relationships in service for UI display
 */
export interface FamilyMember {
  id: number;
  firstName: string;
  lastName: string;
  gender?: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'UNKNOWN';
  dateOfBirth?: string;
  dateOfDeath?: string;
  notes?: string;
  photoUrl?: string;

  // Computed relationships
  generation?: number; // 0=ancestors, 1=parents, 2=self, 3=children, etc.
  parents?: number[]; // parent person IDs
  children?: number[]; // child person IDs
  spouse_id?: number; // partner/spouse ID
}

export interface FamilyTree {
  rootMember: FamilyMember | null;
  members: FamilyMember[];
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  generation: number;
  parentId?: string;
  children?: FamilyMember[];
  birthDate?: string;
  avatar?: string;
}

export interface FamilyTree {
  rootMember: FamilyMember;
  members: FamilyMember[];
}

export type Gender = "male" | "female";
export type LifeStatus = "alive" | "deceased";
export type ChildStatus = "biological" | "adopted" | "step";
export type MarriageStatus = "married" | "divorced" | "widowed";

export interface Person {
  id: string;
  full_name: string;
  gender: Gender;
  birth_date?: string | null;
  birth_order: number;
  life_status: LifeStatus;
  father_id: string | null;
  mother_id: string | null;
  child_status: ChildStatus;
}

export interface Marriage {
  id: string;
  husband_id: string;
  wife_id: string;
  marriage_order: number;
  status: MarriageStatus;
}

export interface FamilyTreeData {
  persons: Person[];
  marriages: Marriage[];
}

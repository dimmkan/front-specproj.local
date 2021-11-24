export interface FilialTable {
  id: number;
  description: string;
  address?: string;
  city?: string;
}

export interface DoctorTable {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  specification: string;
  filialID: number;
  imageURI?: string;
}

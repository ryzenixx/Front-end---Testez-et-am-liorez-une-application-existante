export interface StudentRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface Student extends StudentRequest {
  id: number;
}

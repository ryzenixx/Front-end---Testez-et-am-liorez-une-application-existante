import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Student, StudentRequest } from '../models/student';

export const STUDENTS_URL = '/api/students';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<Student[]> {
    return this.http.get<Student[]>(STUDENTS_URL);
  }

  findById(id: string | number): Observable<Student> {
    return this.http.get<Student>(this.studentUrl(id));
  }

  create(student: StudentRequest): Observable<Student> {
    return this.http.post<Student>(STUDENTS_URL, student);
  }

  update(id: string | number, student: StudentRequest): Observable<Student> {
    return this.http.put<Student>(this.studentUrl(id), student);
  }

  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(this.studentUrl(id));
  }

  private studentUrl(id: string | number): string {
    return STUDENTS_URL + '/' + encodeURIComponent(id);
  }
}

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { Student, StudentRequest } from '../models/student';
import { StudentService } from './student.service';

const studentRequest: StudentRequest = {
  firstName: 'Camille',
  lastName: 'Martin',
  email: 'camille.martin@example.org',
};
const student: Student = { id: 42, ...studentRequest };

describe('StudentService', () => {
  let service: StudentService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StudentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('returns the list of students', async () => {
    const result = firstValueFrom(service.findAll());
    http.expectOne({ method: 'GET', url: '/api/students' }).flush([student]);

    await expect(result).resolves.toEqual([student]);
  });

  it('returns the requested student', async () => {
    const result = firstValueFrom(service.findById(42));
    http.expectOne({ method: 'GET', url: '/api/students/42' }).flush(student);

    await expect(result).resolves.toEqual(student);
  });

  it('returns the created student with an ID', async () => {
    const result = firstValueFrom(service.create(studentRequest));
    http.expectOne({ method: 'POST', url: '/api/students' })
      .flush(student, { status: 201, statusText: 'Created' });

    await expect(result).resolves.toEqual(student);
  });

  it('returns the updated student', async () => {
    const changes: StudentRequest = { ...studentRequest, email: 'camille.durand@example.org' };
    const updated = { id: 42, ...changes };
    const result = firstValueFrom(service.update(42, changes));
    http.expectOne({ method: 'PUT', url: '/api/students/42' }).flush(updated);

    await expect(result).resolves.toEqual(updated);
  });

  it('completes deletion without a response body', async () => {
    const result = firstValueFrom(service.delete(42));
    http.expectOne({ method: 'DELETE', url: '/api/students/42' })
      .flush(null, { status: 204, statusText: 'No Content' });

    await expect(result).resolves.toBeNull();
  });
});

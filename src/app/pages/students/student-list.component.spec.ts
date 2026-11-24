import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { Student } from '../../core/models/student';
import { StudentService } from '../../core/service/student.service';
import { StudentListComponent } from './student-list.component';

const student: Student = {
  id: 42,
  firstName: 'Camille',
  lastName: 'Martin',
  email: 'camille.martin@example.org',
};

describe('StudentListComponent', () => {
  let fixture: ComponentFixture<StudentListComponent>;
  let response: Subject<Student[]>;
  let page: HTMLElement;

  beforeEach(async () => {
    response = new Subject<Student[]>();
    await TestBed.configureTestingModule({
      imports: [StudentListComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: StudentService, useValue: { findAll: () => response } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentListComponent);
    page = fixture.nativeElement;
    fixture.detectChanges();
  });

  function displayStudents(students: Student[]): void {
    response.next(students);
    response.complete();
    fixture.detectChanges();
  }

  it('shows the name and email once the list has loaded', () => {
    expect(page.querySelector('[role="status"]')?.textContent).toBe('Loading students…');

    displayStudents([student]);

    const row = page.querySelector('tbody tr');
    expect(row?.querySelector('a')?.textContent).toBe('Camille Martin');
    expect(row?.querySelector('td')?.textContent).toBe(student.email);
  });

  it('shows an empty list message', () => {
    displayStudents([]);

    expect(page.textContent).toContain('No students.');
  });
});

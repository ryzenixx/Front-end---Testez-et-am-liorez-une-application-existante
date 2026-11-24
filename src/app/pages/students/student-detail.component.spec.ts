import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { filter, firstValueFrom } from 'rxjs';
import { Student } from '../../core/models/student';
import { StudentDetailComponent } from './student-detail.component';
import { StudentListComponent } from './student-list.component';

const student: Student = {
  id: 42,
  firstName: 'Camille',
  lastName: 'Martin',
  email: 'camille.martin@example.org',
};

describe('StudentDetailComponent', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'students', component: StudentListComponent },
          { path: 'students/:id', component: StudentDetailComponent },
        ]),
      ],
    });

    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/students/42', StudentDetailComponent);
    http.expectOne({ method: 'GET', url: '/api/students/42' }).flush(student);
    harness.detectChanges();
  });

  afterEach(() => http.verify());

  function clickButton(label: string): void {
    const buttons = harness.routeNativeElement!.querySelectorAll('button');
    [...buttons].find(button => button.textContent?.trim() === label)!.click();
    harness.detectChanges();
  }

  it('displays the name and email returned by the API', () => {
    const fields = harness.routeNativeElement!.querySelectorAll('dd');

    expect([...fields].map(field => field.textContent)).toEqual(['Camille', 'Martin', student.email]);
  });

  it('returns to the details when deletion is cancelled', () => {
    clickButton('Delete');
    expect(harness.routeNativeElement!.textContent).toContain('Delete this student?');

    clickButton('Cancel');

    expect(harness.routeNativeElement!.textContent).toContain(student.email);
    expect(harness.routeNativeElement!.textContent).not.toContain('Delete this student?');
  });

  it('opens the student list after confirmed deletion', async () => {
    const router = TestBed.inject(Router);
    const listOpened = firstValueFrom(router.events.pipe(
      filter(event => event instanceof NavigationEnd && event.urlAfterRedirects === '/students'),
    ));

    clickButton('Delete');
    clickButton('Delete student');
    http.expectOne({ method: 'DELETE', url: '/api/students/42' })
      .flush(null, { status: 204, statusText: 'No Content' });

    await listOpened;
    http.expectOne({ method: 'GET', url: '/api/students' }).flush([]);
    harness.detectChanges();

    expect(harness.routeNativeElement!.querySelector('h1')?.textContent).toBe('Students');
  });
});

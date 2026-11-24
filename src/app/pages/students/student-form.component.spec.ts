import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { filter, firstValueFrom } from 'rxjs';
import { Student } from '../../core/models/student';
import { StudentDetailComponent } from './student-detail.component';
import { StudentFormComponent } from './student-form.component';

const student: Student = {
  id: 42,
  firstName: 'Camille',
  lastName: 'Martin',
  email: 'camille.martin@example.org',
};

describe('StudentFormComponent', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'students/new', component: StudentFormComponent },
          { path: 'students/:id/edit', component: StudentFormComponent },
          { path: 'students/:id', component: StudentDetailComponent },
        ]),
      ],
    });

    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => http.verify());

  async function openEditForm(): Promise<void> {
    await harness.navigateByUrl('/students/42/edit', StudentFormComponent);
    http.expectOne({ method: 'GET', url: '/api/students/42' }).flush(student);
    harness.detectChanges();
  }

  function fillField(selector: string, value: string): void {
    const input = harness.routeNativeElement!.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  async function save(method: 'POST' | 'PUT', url: string, status: number, statusText: string): Promise<void> {
    const router = TestBed.inject(Router);
    const detailsOpened = firstValueFrom(router.events.pipe(
      filter(event => event instanceof NavigationEnd && event.urlAfterRedirects === '/students/42'),
    ));
    harness.routeNativeElement!.querySelector('form')!
      .dispatchEvent(new Event('submit', { cancelable: true }));

    const request = http.expectOne({ method, url });
    const saved: Student = { ...request.request.body, id: 42 };
    request.flush(saved, { status, statusText });

    await detailsOpened;
    http.expectOne({ method: 'GET', url: '/api/students/42' }).flush(saved);
    harness.detectChanges();
  }

  it('prefills the form with the existing student', async () => {
    await openEditForm();

    const fields = harness.routeNativeElement!.querySelectorAll('input');
    expect([...fields].map(field => field.value)).toEqual(['Camille', 'Martin', student.email]);
  });

  it('shows the new student after saving the add form', async () => {
    await harness.navigateByUrl('/students/new', StudentFormComponent);
    fillField('#first-name', 'Camille');
    fillField('#last-name', 'Martin');
    fillField('#student-email', student.email);

    await save('POST', '/api/students', 201, 'Created');

    const fields = harness.routeNativeElement!.querySelectorAll('dd');
    expect([...fields].map(field => field.textContent)).toEqual(['Camille', 'Martin', student.email]);
  });

  it('shows the new email after saving the edit form', async () => {
    await openEditForm();
    fillField('#student-email', 'camille.durand@example.org');

    await save('PUT', '/api/students/42', 200, 'OK');

    const fields = harness.routeNativeElement!.querySelectorAll('dd');
    expect([...fields].map(field => field.textContent))
      .toEqual(['Camille', 'Martin', 'camille.durand@example.org']);
  });
});

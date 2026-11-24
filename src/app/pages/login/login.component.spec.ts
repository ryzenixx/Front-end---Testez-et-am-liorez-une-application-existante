import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { UserService } from '../../core/service/user.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let page: HTMLElement;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    page = fixture.nativeElement;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  function submit(): void {
    page.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
  }

  function enterCredentials(): void {
    const login = page.querySelector<HTMLInputElement>('#login')!;
    const password = page.querySelector<HTMLInputElement>('#password')!;
    login.value = 'agent.p2';
    password.value = 'test-password';
    login.dispatchEvent(new Event('input'));
    password.dispatchEvent(new Event('input'));
  }

  it('requires both fields before sending a request', () => {
    submit();

    http.expectNone('/api/login');
    expect(page.querySelector('#login-error')?.textContent).toBe('Enter your login.');
    expect(page.querySelector('#password-error')?.textContent).toBe('Enter your password.');
  });

  it('shows loading and signs in with the token returned as text', () => {
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 60 })).replace(/=+$/, '');
    const token = 'header.' + payload + '.signature';
    enterCredentials();
    submit();
    submit();

    const request = http.expectOne({ method: 'POST', url: '/api/login' });
    expect(request.request.body).toEqual({ login: 'agent.p2', password: 'test-password' });
    expect(request.request.responseType).toBe('text');
    expect(page.querySelector('fieldset')?.disabled).toBe(true);
    expect(page.querySelector('button')?.textContent?.trim()).toBe('Signing in…');

    request.flush(token);
    fixture.detectChanges();

    expect(page.querySelector('[role="status"]')?.textContent).toBe('Signed in.');
    expect(TestBed.inject(UserService).activeToken()).toBe(token);
    expect(navigate).toHaveBeenCalledWith('/students');
  });

  it('displays the server message and allows another attempt after a rejection', () => {
    enterCredentials();
    submit();

    const request = http.expectOne('/api/login');
    request.flush(JSON.stringify({ message: 'Bad credentials' }), {
      status: 401,
      statusText: 'Unauthorized',
    });
    fixture.detectChanges();

    expect(page.querySelector('[role="alert"]')?.textContent).toBe('Bad credentials');
    expect(page.querySelector('fieldset')?.disabled).toBe(false);
    expect(TestBed.inject(UserService).authToken()).toBeNull();
  });

  it('shows an error for a response without a token', () => {
    enterCredentials();
    submit();

    http.expectOne('/api/login').flush('');
    fixture.detectChanges();

    expect(page.querySelector('[role="alert"]')?.textContent).toBe('The server did not return a valid token.');
    expect(TestBed.inject(UserService).authToken()).toBeNull();
  });
});

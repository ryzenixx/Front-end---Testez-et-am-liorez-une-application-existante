import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { filter, firstValueFrom } from 'rxjs';
import { routes } from '../../app.routes';
import { LoginComponent } from '../../pages/login/login.component';
import { StudentListComponent } from '../../pages/students/student-list.component';
import { authInterceptor } from '../http/auth.interceptor';
import { UserService } from '../service/user.service';

describe('Student access', () => {
  let http: HttpTestingController;
  let router: Router;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    userService = TestBed.inject(UserService);
  });

  afterEach(() => http.verify());

  function signIn(expiresAt: number): string {
    const payload = btoa(JSON.stringify({ exp: expiresAt })).replace(/=+$/, '');
    const token = 'header.' + payload + '.signature';
    userService.login({ login: 'agent.p2', password: 'test-password' }).subscribe();
    const login = http.expectOne('/api/login');
    expect(login.request.headers.has('Authorization')).toBe(false);
    login.flush(token);
    return token;
  }

  it.each(['/students', '/students/new', '/students/1', '/students/1/edit'])(
    'redirects an anonymous user from %s',
    async path => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl(path, LoginComponent);

      expect(router.url).toBe('/login');
      http.expectNone(request => request.url.startsWith('/api/students'));
    },
  );

  it('redirects an expired session before loading the page', async () => {
    const expiresAt = Math.floor(Date.now() / 1000) + 60;
    signIn(expiresAt);
    const clock = jest.spyOn(Date, 'now').mockReturnValue(expiresAt * 1000);
    try {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/students', LoginComponent);

      expect(router.url).toBe('/login');
      expect(userService.authToken()).toBeNull();
      http.expectNone('/api/students');
    } finally {
      clock.mockRestore();
    }
  });

  it('sends the token and returns to login when the API rejects it', async () => {
    const token = signIn(Math.floor(Date.now() / 1000) + 60);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/students', StudentListComponent);

    const request = http.expectOne('/api/students');
    expect(request.request.headers.get('Authorization')).toBe('Bearer ' + token);
    const returnedToLogin = firstValueFrom(router.events.pipe(
      filter(event => event instanceof NavigationEnd && event.urlAfterRedirects === '/login'),
    ));
    request.flush(null, { status: 401, statusText: 'Unauthorized' });
    await returnedToLogin;

    expect(router.url).toBe('/login');
    expect(userService.authToken()).toBeNull();
  });
});

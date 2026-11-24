import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('completes registration with an empty response', async () => {
    const registration = firstValueFrom(service.register({
      firstName: 'Alex',
      lastName: 'Durand',
      login: 'agent.test',
      password: 'test-password',
    }));

    http.expectOne({ method: 'POST', url: '/api/register' })
      .flush(null, { status: 201, statusText: 'Created' });

    await expect(registration).resolves.toBeNull();
  });

  it('returns the token sent by the login API', async () => {
    const expiresAt = Math.floor(Date.now() / 1000) + 60;
    const payload = btoa(JSON.stringify({ exp: expiresAt })).replace(/=+$/, '');
    const token = 'header.' + payload + '.signature';
    const login = firstValueFrom(service.login({ login: 'agent.test', password: 'test-password' }));

    http.expectOne({ method: 'POST', url: '/api/login' }).flush(token);

    await expect(login).resolves.toBe(token);
  });
});

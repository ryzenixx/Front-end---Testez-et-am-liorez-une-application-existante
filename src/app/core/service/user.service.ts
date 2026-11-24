import { Injectable, computed, signal } from '@angular/core';
import { LoginRequest } from '../models/login-request';
import { Register } from '../models/Register';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly session = signal<{ token: string; expiresAt: number } | null>(null);
  readonly authToken = computed(() => this.session()?.token ?? null);

  constructor(private httpClient: HttpClient) { }

  register(user: Register): Observable<Object> {
    return this.httpClient.post('/api/register', user);
  }

  login(credentials: LoginRequest): Observable<string> {
    return this.httpClient.post('/api/login', credentials, { responseType: 'text' }).pipe(
      tap(token => {
        const expiresAt = this.tokenExpiresAt(token);
        if (expiresAt === null || expiresAt <= Date.now()) {
          throw new Error('The server did not return a valid token.');
        }
        this.session.set({ token, expiresAt });
      }),
    );
  }

  activeToken(): string | null {
    const session = this.session();
    if (session && session.expiresAt > Date.now()) {
      return session.token;
    }
    this.clearSession();
    return null;
  }

  clearSession(): void {
    this.session.set(null);
  }

  private tokenExpiresAt(token: string): number | null {
    if (!/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) {
      return null;
    }

    const payload = token.split('.')[1].replaceAll('-', '+').replaceAll('_', '/');
    try {
      const { exp } = JSON.parse(atob(payload)) as { exp?: unknown };
      return typeof exp === 'number' && Number.isFinite(exp * 1000) ? exp * 1000 : null;
    } catch {
      return null;
    }
  }
}

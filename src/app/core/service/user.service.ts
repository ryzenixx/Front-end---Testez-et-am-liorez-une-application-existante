import { Injectable, signal } from '@angular/core';
import { LoginRequest } from '../models/login-request';
import { Register } from '../models/Register';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly token = signal<string | null>(null);
  readonly authToken = this.token.asReadonly();

  constructor(private httpClient: HttpClient) { }

  register(user: Register): Observable<Object> {
    return this.httpClient.post('/api/register', user);
  }

  login(credentials: LoginRequest): Observable<string> {
    return this.httpClient.post('/api/login', credentials, { responseType: 'text' }).pipe(
      tap(token => {
        if (!/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) {
          throw new Error('The server did not return a valid token.');
        }
        this.token.set(token);
      }),
    );
  }
}

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { STUDENTS_URL } from '../service/student.service';
import { UserService } from '../service/user.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.url !== STUDENTS_URL && !request.url.startsWith(STUDENTS_URL + '/')) {
    return next(request);
  }

  const userService = inject(UserService);
  const router = inject(Router);
  const token = userService.activeToken();
  const authenticatedRequest = token
    ? request.clone({ setHeaders: { Authorization: 'Bearer ' + token } })
    : request;

  return next(authenticatedRequest).pipe(
    tap({
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401 && userService.authToken() === token) {
          userService.clearSession();
          void router.navigateByUrl('/login');
        }
      },
    }),
  );
};

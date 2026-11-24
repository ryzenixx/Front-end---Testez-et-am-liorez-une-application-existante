import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { UserService } from '../service/user.service';

export const authGuard: CanActivateChildFn = () => {
  const userService = inject(UserService);
  return userService.activeToken() ? true : inject(Router).createUrlTree(['/login']);
};

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { StudentDetailComponent } from './pages/students/student-detail.component';
import { StudentFormComponent } from './pages/students/student-form.component';
import { StudentListComponent } from './pages/students/student-list.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'students',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'students',
    canActivateChild: [authGuard],
    children: [
      { path: '', component: StudentListComponent },
      { path: 'new', component: StudentFormComponent },
      { path: ':id/edit', component: StudentFormComponent },
      { path: ':id', component: StudentDetailComponent },
    ],
  },
];

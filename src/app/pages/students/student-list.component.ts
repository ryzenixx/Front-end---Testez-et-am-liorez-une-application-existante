import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../core/http/api-error';
import { Student } from '../../core/models/student';
import { StudentService } from '../../core/service/student.service';
import { UserService } from '../../core/service/user.service';

@Component({
  selector: 'app-student-list',
  imports: [RouterLink],
  templateUrl: './student-list.component.html',
})
export class StudentListComponent {
  private readonly studentService = inject(StudentService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  protected readonly students = signal<Student[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');

  constructor() {
    this.studentService.findAll().pipe(
      takeUntilDestroyed(),
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: students => this.students.set(students),
      error: (error: unknown) => this.errorMessage.set(apiErrorMessage(error, 'Unable to load students')),
    });
  }

  protected signOut(): void {
    this.userService.clearSession();
    void this.router.navigateByUrl('/login');
  }
}

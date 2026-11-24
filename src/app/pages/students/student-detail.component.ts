import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, catchError, finalize, switchMap } from 'rxjs';
import { apiErrorMessage } from '../../core/http/api-error';
import { Student } from '../../core/models/student';
import { StudentService } from '../../core/service/student.service';

@Component({
  selector: 'app-student-detail',
  imports: [RouterLink],
  templateUrl: './student-detail.component.html',
})
export class StudentDetailComponent {
  private readonly studentService = inject(StudentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly student = signal<Student | null>(null);
  protected readonly loading = signal(true);
  protected readonly deleting = signal(false);
  protected readonly confirmingDelete = signal(false);
  protected readonly errorMessage = signal('');

  constructor() {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.student.set(null);
        this.loading.set(true);
        this.confirmingDelete.set(false);
        this.errorMessage.set('');

        return this.studentService.findById(params.get('id')!).pipe(
          catchError((error: unknown) => {
            this.errorMessage.set(apiErrorMessage(error, 'Unable to load the student'));
            return EMPTY;
          }),
          finalize(() => this.loading.set(false)),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(student => this.student.set(student));
  }

  protected deleteStudent(id: number): void {
    if (this.deleting()) {
      return;
    }

    this.errorMessage.set('');
    this.deleting.set(true);
    this.studentService.delete(id).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.deleting.set(false)),
    ).subscribe({
      next: () => void this.router.navigateByUrl('/students'),
      error: (error: unknown) => this.errorMessage.set(apiErrorMessage(error, 'Unable to delete the student')),
    });
  }
}

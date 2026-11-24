import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, catchError, finalize, switchMap } from 'rxjs';
import { apiErrorMessage } from '../../core/http/api-error';
import { StudentService } from '../../core/service/student.service';

const nameValidators = [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)];

@Component({
  selector: 'app-student-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './student-form.component.html',
})
export class StudentFormComponent {
  private readonly studentService = inject(StudentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly studentId = signal(this.route.snapshot.paramMap.get('id'));
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly loadError = signal('');
  protected readonly saveError = signal('');
  protected readonly form = inject(FormBuilder).nonNullable.group({
    firstName: ['', nameValidators],
    lastName: ['', nameValidators],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
  });

  constructor() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        this.studentId.set(id);
        this.form.reset();
        this.loadError.set('');
        this.saveError.set('');

        if (id === null) {
          return EMPTY;
        }

        this.loading.set(true);
        return this.studentService.findById(id).pipe(
          catchError((error: unknown) => {
            this.loadError.set(apiErrorMessage(error, 'Unable to load the student'));
            return EMPTY;
          }),
          finalize(() => this.loading.set(false)),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(({ firstName, lastName, email }) => this.form.reset({ firstName, lastName, email }));
  }

  protected saveStudent(): void {
    if (this.saving() || this.loading() || this.loadError()) {
      return;
    }

    this.saveError.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.studentId();
    const student = this.form.getRawValue();
    const request = id === null ? this.studentService.create(student) : this.studentService.update(id, student);

    this.saving.set(true);
    request.pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.saving.set(false)),
    ).subscribe({
      next: saved => void this.router.navigate(['/students', saved.id]),
      error: (error: unknown) => this.saveError.set(apiErrorMessage(error, 'Unable to save the student')),
    });
  }
}

import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { UserService } from '../../core/service/user.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    login: ['', [Validators.required, Validators.pattern(/\S/)]],
    password: ['', [Validators.required, Validators.pattern(/\S/)]],
  });
  protected readonly authToken = this.userService.authToken;
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  protected onSubmit(): void {
    if (this.loading()) {
      return;
    }

    this.errorMessage.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.userService.login(this.form.getRawValue())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: () => this.form.controls.password.reset(),
        error: (error: unknown) => this.errorMessage.set(this.loginErrorMessage(error)),
      });
  }

  private loginErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return error instanceof Error ? error.message : 'Sign-in failed.';
    }
    if (error.status === 0) {
      return 'Unable to reach the server.';
    }

    const fallback = 'Sign-in failed (HTTP ' + error.status + ').';
    const body: unknown = error.error;
    if (typeof body !== 'string' || !body.trim()) {
      return fallback;
    }

    try {
      const response = JSON.parse(body) as { message?: string; detail?: string } | null;
      return response?.message || response?.detail || fallback;
    } catch {
      return error.headers.get('Content-Type')?.startsWith('text/plain') ? body.trim() : fallback;
    }
  }
}

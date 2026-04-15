import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = false;
  errorMessage = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      email: this.loginForm.value.email || '',
      password: this.loginForm.value.password || ''
    };

    this.authService.login(payload).subscribe({
      next: (response) => {
        this.loading = false;

        const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');

        if (response.user.role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
          return;
        }

        if (redirectTo) {
          this.router.navigateByUrl(redirectTo);
          return;
        }

        this.router.navigate(['/']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error?.error?.message || 'No se pudo iniciar sesión. Intentá nuevamente.';
      }
    });
  }
}
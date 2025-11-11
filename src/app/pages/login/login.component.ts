import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string = '';
  hidePassword = true;

  // Demo credentials for convenience
  demoCredentials = {
    email: 'demo@example.com',
    password: 'password123'
  };

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // If already logged in, redirect to dashboard
    if (this.authService.isAuthenticatedValue) {
      this.router.navigate([this.returnUrl]);
    }
  }

  private initializeForm() {
    this.loginForm = this.formBuilder.group({
      email: [
        '',
        [Validators.required, Validators.email]
      ],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
        this.router.navigate([this.returnUrl]);
      },
      error: error => {
        this.loading = false;
        const message = error?.message || 'Login failed. Please try again.';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      }
    });
  }

  fillDemoCredentials() {
    this.loginForm.patchValue(this.demoCredentials);
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
}

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonInput,
  IonItem,
  IonText,
  IonTitle,
} from '@ionic/angular';
import { AuthService, Credenciales, NuevoUsuario } from '../core/auth.service';
import { getApiErrorMessage } from '../core/api-error';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonInput,
    IonItem,
    IonText,
    IonTitle,
  ],
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isRegistering = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  credentials: Credenciales = { email: '', password: '' };
  newUser: NuevoUsuario = {
    nombre: '',
    email: '',
    password: '',
    fechaCreacion: '',
  };

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.credentials.email.trim() || !this.credentials.password) {
      this.errorMessage = 'Ingresa tu correo y contraseña.';
      return;
    }

    if (this.isRegistering) {
      this.register();
      return;
    }

    this.isLoading = true;
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.isLoading = false;
        void this.router.navigateByUrl('/tabs/tab1');
      },
      error: (error: unknown) => {
        this.isLoading = false;
        this.errorMessage = getApiErrorMessage(error, 'No se pudo iniciar sesión');
      },
    });
  }

  private register(): void {
    const nombre = this.newUser.nombre.trim();
    if (!nombre) {
      this.errorMessage = 'Ingresa tu nombre.';
      return;
    }
    if (this.credentials.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    const user: NuevoUsuario = {
      nombre,
      email: this.credentials.email.trim(),
      password: this.credentials.password,
      fechaCreacion: new Date().toISOString(),
    };
    this.isLoading = true;
    this.authService.register(user).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (!response) {
          this.errorMessage = 'El servidor no confirmó la creación de la cuenta.';
          return;
        }
        this.isRegistering = false;
        this.newUser = { nombre: '', email: '', password: '', fechaCreacion: '' };
        this.successMessage = 'Cuenta creada. Ahora puedes iniciar sesión.';
      },
      error: (error: unknown) => {
        this.isLoading = false;
        this.errorMessage = getApiErrorMessage(error, 'No se pudo crear la cuenta');
      },
    });
  }

  toggleMode(): void {
    this.isRegistering = !this.isRegistering;
    this.errorMessage = '';
    this.successMessage = '';
  }
}

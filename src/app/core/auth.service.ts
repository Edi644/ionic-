import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  idusuario: number;
  nombre: string;
  email: string;
}

export interface Credenciales {
  email: string;
  password: string;
}

export interface NuevoUsuario extends Credenciales {
  nombre: string;
  fechaCreacion: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'usuario';
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  get currentUser(): Usuario | null {
    const storedUser = localStorage.getItem(this.storageKey);
    if (!storedUser) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(storedUser);
      return this.normalizeUsuario(parsed);
    } catch {
      return null;
    }
  }

  login(credentials: Credenciales): Observable<unknown> {
    return this.http
      .post<unknown>(`${environment.apiUrl}/usuarioProyecto/login`, {
        correo: credentials.email,
        contrasena: credentials.password,
      })
      .pipe(
        map((response) => {
          const usuario = this.normalizeUsuario(response);
          if (!usuario) {
            throw new Error('Correo o contraseña incorrectos, o respuesta de usuario no válida.');
          }
          localStorage.setItem(this.storageKey, JSON.stringify(usuario));
          return usuario;
        }),
      );
  }

  register(user: NuevoUsuario): Observable<unknown> {
    return this.http.post<unknown>(`${environment.apiUrl}/usuarioProyecto/guardar`, {
      nombres: user.nombre,
      correo: user.email,
      contrasena: user.password,
      fechaCreacion: user.fechaCreacion,
    });
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    void this.router.navigateByUrl('/login');
  }

  private normalizeUsuario(value: unknown): Usuario | null {
    if (typeof value !== 'object' || value === null) {
      return null;
    }
    const usuario = value as {
      idusuario?: unknown;
      idusario?: unknown;
      nombre?: unknown;
      nombres?: unknown;
      nombreUsuario?: unknown;
      email?: unknown;
      correo?: unknown;
    };
    const id = usuario.idusuario ?? usuario.idusario;
    const email = usuario.email ?? usuario.correo;
    const nombre = usuario.nombre ?? usuario.nombres ?? usuario.nombreUsuario;

    if (typeof id !== 'number' || typeof email !== 'string') {
      return null;
    }

    return {
      idusuario: id,
      nombre: typeof nombre === 'string' ? nombre.trim() : '',
      email,
    };
  }
}

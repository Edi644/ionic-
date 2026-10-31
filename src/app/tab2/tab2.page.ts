import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth.service';
import { getApiErrorMessage } from '../core/api-error';
import { PeliculaPipe } from '../pelicula.pipe';

interface Pelicula {
  idPelicula: number;
  titulo: string;
}

interface Funcion {
  idFuncion: number;
  idPelicula?: number;
  pelicula?: { idPelicula?: number; titulo?: string };
  fecha?: string;
  hora?: string;
  precioEntrada?: number;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    PeliculaPipe,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonSpinner,
    IonText,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab2Page {
  private readonly http = inject(HttpClient);

  readonly funciones = signal<Funcion[]>([]);
  readonly peliculas = signal<Pelicula[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  constructor() {
    this.buscarPeliculas();
    this.buscarFunciones();
  }

  buscarPeliculas(): void {
    this.http.get<Pelicula[]>(`${environment.apiUrl}/pelicula/buscar`).subscribe({
      next: (data) => {
        if (!Array.isArray(data)) {
          this.errorMessage.set('El servidor devolvió una lista de películas no válida.');
          return;
        }
        this.peliculas.set(data);
      },
      error: (error: unknown) => {
        this.errorMessage.set(getApiErrorMessage(error, 'No se pudieron cargar las películas'));
      },
    });
  }

  buscarFunciones(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.http
      .get<Funcion[]>(`${environment.apiUrl}/funcion/buscar`)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          if (!Array.isArray(data)) {
            this.errorMessage.set('El servidor devolvió una lista de funciones no válida.');
            return;
          }
          this.funciones.set(data);
        },
        error: (error: unknown) => {
          this.errorMessage.set(getApiErrorMessage(error, 'No se pudieron cargar las funciones'));
        },
      });
  }

}

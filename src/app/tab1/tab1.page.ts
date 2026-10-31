import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TimeoutError, finalize, timeout } from 'rxjs';
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonSpinner,
  IonText,
} from '@ionic/angular';
import { environment } from '../../environments/environment';
import { getApiErrorMessage } from '../core/api-error';

interface Anuncio {
  idAnuncio?: number;
  idanuncio?: number;
  titulo?: string;
  descripcion?: string;
  fechaPublicacion?: string;
  imagen?: string | null;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonSpinner,
    IonText,
    CommonModule,
  ],
})
export class Tab1Page {
  private readonly http = inject(HttpClient);
  readonly anuncios = signal<Anuncio[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  constructor() {
    this.buscarAnuncios();
  }

  buscarAnuncios(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.http
      .get<Anuncio | Anuncio[]>(`${environment.apiUrl}/anuncio/buscar`)
      .pipe(
        timeout({ first: 15000 }),
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (data) => {
          if (Array.isArray(data)) {
            this.anuncios.set(data);
          } else if (data && typeof data === 'object') {
            this.anuncios.set([data]);
          } else {
            this.errorMessage.set('El servidor devolvió una lista de anuncios no válida.');
            this.anuncios.set([]);
          }
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            error instanceof TimeoutError
              ? 'El servidor no respondió en 15 segundos. Verifica que el backend esté activo y que la URL de la API sea accesible desde este dispositivo.'
              : getApiErrorMessage(error, 'No se pudieron cargar los anuncios'),
          );
        },
      });
  }
}

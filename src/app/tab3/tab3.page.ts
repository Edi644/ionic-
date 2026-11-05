import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { IonContent } from '@ionic/angular';
import { environment } from '../../environments/environment';
import { getApiErrorMessage } from '../core/api-error';
import { AuthService } from '../core/auth.service';
import { PeliculaPipe } from '../pelicula.pipe';

interface Pelicula {
  idPelicula: number;
  titulo: string;
  idClasificacion?: number;
  clasificacion?: { nombre?: string };
}

interface Funcion {
  idFuncion: number;
  idPelicula?: number;
  pelicula?: Pelicula;
  fecha?: string;
  hora?: string;
  precioEntrada?: number;
}

interface Cliente {
  idCliente: number;
  correo: string;
}

interface ReservaRequest {
  idCliente: number;
  idFuncion: number;
  cantidadEntradas: number;
  totalAPagar: number;
  fechaReserva: string;
}
interface Clasificacion {
  idClasificacion: number;
  nombre: string;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonContent, PeliculaPipe],
})
export class Tab3Page {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  funciones: Funcion[] = [];
  peliculas: Pelicula[] = [];
  idCliente: number | null = null;
  idFuncion: number | null = null;
  cantidadEntradas: number | null = null;
  isLoadingCliente = false;
  isSaving = false;
  clienteErrorMessage = '';
  errorMessage = '';
  successMessage = '';
  clasificaciones: Clasificacion[] = [];

  constructor() {
    this.buscarClienteUsuario();
    this.buscarPeliculas();
    this.buscarFunciones();
    this.buscarClasificaciones();
  }

  private buscarClienteUsuario(): void {
    const usuario = this.authService.currentUser;
    if (!usuario) {
      this.clienteErrorMessage = 'Inicia sesión para poder realizar una reserva.';
      return;
    }

    this.isLoadingCliente = true;
    this.http
      .get<unknown>(`${environment.apiUrl}/cliente/buscar`)
      .pipe(finalize(() => (this.isLoadingCliente = false)))
      .subscribe({
        next: (data) => {
          const clientes = this.normalizarClientes(data);
          if (!clientes) {
            this.clienteErrorMessage = 'El servidor devolvió una lista de clientes no válida.';
            return;
          }

          const correoUsuario = usuario.email.trim().toLocaleLowerCase();
          const clientesUsuario = clientes.filter(
            (cliente) => cliente.correo.trim().toLocaleLowerCase() === correoUsuario,
          );
          if (clientesUsuario.length !== 1) {
            this.clienteErrorMessage =
              clientesUsuario.length === 0
                ? 'No se encontró un cliente vinculado al correo de tu cuenta.'
                : 'Hay varios clientes con el correo de tu cuenta; no se puede determinar cuál usar.';
            return;
          }

          this.idCliente = clientesUsuario[0].idCliente;
          this.clienteErrorMessage = '';
        },
        error: (error: unknown) => {
          this.clienteErrorMessage = getApiErrorMessage(
            error,
            'No se pudo encontrar el cliente de tu cuenta',
          );
        },
      });
  }

  private normalizarClientes(data: unknown): Cliente[] | null {
    const registros = Array.isArray(data) ? data : [data];
    const clientes: Cliente[] = [];

    for (const registro of registros) {
      if (typeof registro !== 'object' || registro === null) {
        return null;
      }

      const cliente = registro as { idCliente?: unknown; correo?: unknown };
      if (
        typeof cliente.idCliente !== 'number' ||
        !Number.isInteger(cliente.idCliente) ||
        cliente.idCliente <= 0 ||
        typeof cliente.correo !== 'string'
      ) {
        return null;
      }
      clientes.push({ idCliente: cliente.idCliente, correo: cliente.correo });
    }

    return clientes;
  }

  private buscarPeliculas(): void {
    this.http.get<Pelicula[]>(`${environment.apiUrl}/pelicula/buscar`).subscribe({
      next: (data) => {
        if (!Array.isArray(data)) {
          this.errorMessage = 'El servidor devolvió una lista de películas no válida.';
          return;
        }
        this.peliculas = data;
      },
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error, 'No se pudieron cargar las películas');
      },
    });
  }

  private buscarFunciones(): void {
    this.http.get<Funcion[]>(`${environment.apiUrl}/funcion/buscar`).subscribe({
      next: (data) => {
        if (!Array.isArray(data)) {
          this.errorMessage = 'El servidor devolvió una lista de funciones no válida.';
          return;
        }
        this.funciones = data;
      },
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error, 'No se pudieron cargar las funciones');
      },
    });
  }

  private buscarClasificaciones(): void {
    this.http.get<Clasificacion[]>(`${environment.apiUrl}/clasificacion/buscar`).subscribe({
      next: (data) => {
        if (!Array.isArray(data)) {
          this.errorMessage = 'El servidor devolvió una lista de clasificaciones no válida.';
          return;
        }
        this.clasificaciones = data;
      },
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(
          error,
          'No se pudieron cargar las clasificaciones',
        );
      },
    });
  }

  peliculaDeFuncion(funcion: Funcion): Pelicula | undefined {
    const idPelicula = funcion.idPelicula ?? funcion.pelicula?.idPelicula;
    return funcion.pelicula ?? this.peliculas.find((pelicula) => pelicula.idPelicula === idPelicula);
  }

  nombreClasificacion(funcion: Funcion): string {
    const pelicula = this.peliculaDeFuncion(funcion);
    const idClasificacion = pelicula?.idClasificacion;
    return (
      pelicula?.clasificacion?.nombre
      || this.clasificaciones.find(
        (clasificacion) => clasificacion.idClasificacion === idClasificacion,
      )?.nombre
      || 'Sin clasificación'
    );
  }

  actualizarFuncionSeleccionada(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const idFuncion = value === '' ? null : Number(value);
    this.idFuncion =
      idFuncion !== null && Number.isInteger(idFuncion) && idFuncion > 0 ? idFuncion : null;
  }

  actualizarCantidadEntradas(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.cantidadEntradas = input.value === '' ? null : input.valueAsNumber;
  }

  crearReserva(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const usuario = this.authService.currentUser;
    const idFuncion = this.idFuncion;
    const cantidadEntradas = Number(this.cantidadEntradas);

    if (!usuario) {
      this.errorMessage = 'Inicia sesión para poder realizar una reserva.';
      return;
    }
    if (this.idCliente === null) {
      this.errorMessage = 'No se encontró un cliente vinculado a tu cuenta.';
      return;
    }
    if (idFuncion === null || !Number.isInteger(idFuncion) || idFuncion <= 0) {
      this.errorMessage = 'Selecciona una función válida.';
      return;
    }
    if (!Number.isInteger(cantidadEntradas) || cantidadEntradas <= 0) {
      this.errorMessage = 'Ingresa una cantidad válida de entradas.';
      return;
    }

    const funcion = this.funciones.find((item) => item.idFuncion === idFuncion);
    const precio = Number(funcion?.precioEntrada);
    if (!funcion || !Number.isFinite(precio) || precio < 0) {
      this.errorMessage = 'No se encontró el precio de la función seleccionada.';
      return;
    }

    const reserva: ReservaRequest = {
      idCliente: this.idCliente,
      idFuncion,
      cantidadEntradas,
      totalAPagar: cantidadEntradas * precio,
      fechaReserva: this.fechaLocalDateTime(),
    };

    this.isSaving = true;
    this.http
      .post<unknown>(`${environment.apiUrl}/reserva/guardar`, reserva)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (response) => {
          if (typeof response !== 'object' || response === null) {
            this.errorMessage = 'El servidor no confirmó la creación de la reserva.';
            return;
          }
          const reservaGuardada = response as { idReserva?: unknown };
          this.successMessage =
            typeof reservaGuardada.idReserva === 'number'
              ? `Reserva creada exitosamente con ID: ${reservaGuardada.idReserva}`
              : 'Reserva creada exitosamente.';
          this.idFuncion = null;
          this.cantidadEntradas = null;
        },
        error: (error: unknown) => {
          this.errorMessage = getApiErrorMessage(error, 'No se pudo guardar la reserva');
        },
      });
  }

  private fechaLocalDateTime(): string {
    const ahora = new Date();
    const fechaLocal = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000);
    return fechaLocal.toISOString().slice(0, 19);
  }
}

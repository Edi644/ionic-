import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { afterEach, describe, expect, it } from 'vitest';

import { Tab3Page } from './tab3.page';
import { environment } from '../../environments/environment';

describe('Tab3Page', () => {
  let component: Tab3Page;
  let fixture: ComponentFixture<Tab3Page>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    localStorage.setItem('usuario', JSON.stringify({
      idusuario: 99,
      nombre: 'Cliente',
      email: 'cliente@example.com',
    }));

    await TestBed.configureTestingModule({
      imports: [Tab3Page],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Tab3Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.removeItem('usuario');
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    httpTestingController
      .expectOne(`${environment.apiUrl}/cliente/buscar`)
      .flush([{ idCliente: 12, correo: 'cliente@example.com' }]);
    httpTestingController
      .expectOne(`${environment.apiUrl}/pelicula/buscar`)
      .flush([]);
    httpTestingController
      .expectOne(`${environment.apiUrl}/funcion/buscar`)
      .flush([]);
  });

  it('creates a reservation with the signed-in customer and selected function', () => {
    httpTestingController
      .expectOne(`${environment.apiUrl}/cliente/buscar`)
      .flush([{ idCliente: 12, correo: 'cliente@example.com' }]);
    httpTestingController
      .expectOne(`${environment.apiUrl}/pelicula/buscar`)
      .flush([{ idPelicula: 8, titulo: 'Película de prueba' }]);
    httpTestingController
      .expectOne(`${environment.apiUrl}/funcion/buscar`)
      .flush([{
        idFuncion: 3,
        precioEntrada: 50,
        pelicula: { idPelicula: 8, titulo: 'Película de prueba' },
      }]);
    fixture.detectChanges();
    component.idFuncion = 3;
    component.cantidadEntradas = 2;
    component.crearReserva();

    const request = httpTestingController.expectOne(`${environment.apiUrl}/reserva/guardar`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toMatchObject({
      idCliente: 12,
      idFuncion: 3,
      cantidadEntradas: 2,
      totalAPagar: 100,
    });
    expect(request.request.body.fechaReserva).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    request.flush({ idReserva: 27 });

    expect(component.successMessage).toBe('Reserva creada exitosamente con ID: 27');
    expect(component.idFuncion).toBeNull();
    expect(component.cantidadEntradas).toBeNull();
  });
});

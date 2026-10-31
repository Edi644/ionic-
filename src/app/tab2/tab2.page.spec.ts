import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { Tab2Page } from './tab2.page';
import { environment } from '../../environments/environment';

describe('Tab2Page', () => {
  let component: Tab2Page;
  let fixture: ComponentFixture<Tab2Page>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tab2Page],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Tab2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => httpTestingController.verify());

  it('loads and displays movies and functions without loading reservations', () => {
    expect(component).toBeTruthy();

    httpTestingController
      .expectOne(`${environment.apiUrl}/pelicula/buscar`)
      .flush([{ idPelicula: 9, titulo: 'La momia 2' }]);

    httpTestingController
      .expectOne(`${environment.apiUrl}/funcion/buscar`)
      .flush([{
        fecha: '2026-12-12',
        hora: '07:00:00',
        idFuncion: 3,
        idSala: 9,
        idPelicula: 9,
        pelicula: {
          duracionMinutos: 125,
          idClasificacion: 1,
          idGenero: 3,
          idPelicula: 9,
          imagenPromocional: null,
          sinopsis: 'Esta es la historia de un explorador que encontró una momia.',
          titulo: 'La momia 2',
        },
        precioEntrada: 50,
      }]);

    fixture.detectChanges();
    expect(component.funciones()).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain('La momia 2');
    expect(fixture.nativeElement.textContent).toContain('07:00:00');
    expect(component.peliculas()).toHaveLength(1);
    expect(fixture.nativeElement.textContent).not.toContain('Nueva reserva');
  });
});

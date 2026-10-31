import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { Tab1Page } from './tab1.page';
import { environment } from '../../environments/environment';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tab1Page],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => httpTestingController.verify());

  it('loads a single anuncio object from the API', () => {
    expect(component).toBeTruthy();

    httpTestingController
      .expectOne(`${environment.apiUrl}/anuncio/buscar`)
      .flush({
        descripcion: 'tremenda pelicula de guerra',
        fechaPublicacion: '2026-09-18T21:06:35',
        idAnuncio: 3,
        imagen: null,
        titulo: 'rambo',
      });

    fixture.detectChanges();
    expect(component.anuncios()).toHaveLength(1);
    expect(component.anuncios()[0].titulo).toBe('rambo');
    expect(fixture.nativeElement.textContent).toContain('tremenda pelicula de guerra');
  });
});

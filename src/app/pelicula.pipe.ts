import { Pipe, PipeTransform } from '@angular/core';

interface Pelicula {
  idPelicula: number;
  titulo: string;
}

@Pipe({
  name: 'pelicula',
  standalone: true,
})
export class PeliculaPipe implements PipeTransform {
  transform(value: number | null | undefined, peliculas: Pelicula[] | null): string {
    if (!peliculas) {
      return 'Cargando...';
    }

    return peliculas.find((pelicula) => pelicula.idPelicula === value)?.titulo ?? 'No tiene valor';
  }
}

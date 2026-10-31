import { HttpErrorResponse } from '@angular/common/http';

export function getApiErrorMessage(error: unknown, action: string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return `El navegador no pudo acceder a ${error.url ?? 'la API'}. Si el backend está activo, revisa que permita por CORS el origen de esta aplicación.`;
    }
    if (error.status === 404) {
      return `La ruta ${error.url ?? 'solicitada'} no existe en el backend (404). Verifica la ruta configurada para esta operación.`;
    }
    const serverMessage =
      typeof error.error === 'object' && error.error !== null
        ? ('message' in error.error && typeof error.error.message === 'string'
          ? error.error.message
          : 'error' in error.error && typeof error.error.error === 'string'
            ? error.error.error
            : null)
        : null;
    return typeof serverMessage === 'string'
      ? `${action}: ${serverMessage}.`
      : `${action} (código ${error.status}).`;
  }

  return error instanceof Error ? error.message : action;
}

import { HttpErrorResponse } from '@angular/common/http';

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return error instanceof Error ? error.message : fallback + '.';
  }
  if (error.status === 0) {
    return 'Unable to reach the server.';
  }

  const defaultMessage = fallback + ' (HTTP ' + error.status + ').';
  let body: unknown = error.error;
  if (typeof body === 'string') {
    const text = body.trim();
    try {
      body = JSON.parse(text);
    } catch {
      return error.headers.get('Content-Type')?.startsWith('text/plain') && text
        ? text
        : defaultMessage;
    }
  }

  if (body && typeof body === 'object') {
    if ('message' in body && typeof body.message === 'string' && body.message) {
      return body.message;
    }
    if ('detail' in body && typeof body.detail === 'string' && body.detail) {
      return body.detail;
    }
  }
  return defaultMessage;
}

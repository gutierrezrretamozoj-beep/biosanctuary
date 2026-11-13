export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export class RateLimitError extends ApiError {
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number, message: string, data?: unknown) {
    super(429, message, data);
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "No tienes permisos suficientes para realizar esta acción.", data?: unknown) {
    super(403, message, data);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, data?: unknown) {
    super(409, message, data);
    this.name = "ConflictError";
  }
}

export interface ApiFetchOptions extends RequestInit {
  idempotencyKey?: string;
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { idempotencyKey, headers = {}, ...rest } = options;

  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has("Content-Type") && !(options.body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (idempotencyKey) {
    requestHeaders.set("Idempotency-Key", idempotencyKey);
  }

  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw err;
    }
    throw new ApiError(0, "No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.");
  }

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(401, "Tu sesión ha expirado. Por favor ingresa nuevamente.");
  }

  if (response.status === 429) {
    const retryHeader = response.headers.get("Retry-After");
    let seconds = retryHeader ? parseInt(retryHeader, 10) : 30;
    let errorMessage = "Límite de peticiones excedido. Espera unos segundos antes de intentar de nuevo.";

    try {
      const errorJson = await response.json();
      if (errorJson.retryAfterSeconds) {
        seconds = errorJson.retryAfterSeconds;
      }
      if (errorJson.error) {
        errorMessage = errorJson.error;
      }
    } catch {
      // Ignorar fallback
    }

    throw new RateLimitError(seconds, errorMessage);
  }

  if (response.status === 403) {
    let msg = "No tienes permisos suficientes para realizar esta acción.";
    try {
      const data = await response.json();
      if (data.error) msg = data.error;
    } catch {}
    throw new ForbiddenError(msg);
  }

  if (response.status === 409) {
    let msg = "Conflicto de dominio con el estado actual del recurso.";
    try {
      const data = await response.json();
      if (data.error) msg = data.error;
    } catch {}
    throw new ConflictError(msg);
  }

  if (!response.ok) {
    let msg = "Ocurrió un error inesperado al procesar tu solicitud.";
    let data: unknown;
    try {
      data = await response.json();
      if (data && typeof data === "object" && "error" in data) {
        msg = String((data as { error: unknown }).error);
      }
    } catch {}
    throw new ApiError(response.status, msg, data);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

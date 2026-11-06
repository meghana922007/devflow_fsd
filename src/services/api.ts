export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) return undefined as T;

  const result = await response.json() as { error?: string } & T;
  if (!response.ok) {
    throw new ApiError(result.error ?? `Request failed (${response.status}).`, response.status);
  }
  return result;
}

export function reportApiError(error: unknown) {
  return error instanceof Error ? error.message : 'The request could not be completed.';
}

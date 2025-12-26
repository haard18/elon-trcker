import { NextResponse } from 'next/server';

export function createErrorResponse(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : 'An unknown error occurred';
  
  console.error('API Error:', {
    message,
    error,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json(
    {
      error: message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function createSuccessResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

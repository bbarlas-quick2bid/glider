// Custom error classes

export class GliderError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'GliderError';
  }
}

export class AuthError extends GliderError {
  constructor(message: string, code: string = 'AUTH_ERROR') {
    super(message, code, 401);
    this.name = 'AuthError';
  }
}

export class GmailError extends GliderError {
  constructor(message: string, code: string = 'GMAIL_ERROR') {
    super(message, code, 500);
    this.name = 'GmailError';
  }
}

export class AIError extends GliderError {
  constructor(message: string, code: string = 'AI_ERROR') {
    super(message, code, 500);
    this.name = 'AIError';
  }
}

export class DatabaseError extends GliderError {
  constructor(message: string, code: string = 'DATABASE_ERROR') {
    super(message, code, 500);
    this.name = 'DatabaseError';
  }
}

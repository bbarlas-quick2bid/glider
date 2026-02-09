// Authentication types

export interface User {
  id: string;
  email: string;
  googleId: string;
  name: string | null;
  picture: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiryDate: number; // Unix timestamp
}

export interface SessionData {
  userId: string;
  email: string;
  isLoggedIn: boolean;
}

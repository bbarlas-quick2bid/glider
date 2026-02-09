// Database query functions

import { query } from './client';
import { User, OAuthTokens } from '@/lib/types/auth';
import { encryptToken, decryptToken } from '@/lib/auth/tokens';

// User queries
export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

export async function findUserByGoogleId(googleId: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE google_id = $1',
    [googleId]
  );
  return result.rows[0] || null;
}

export async function findUserById(userId: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

export async function createUser(userData: {
  email: string;
  googleId: string;
  name: string | null;
  picture: string | null;
}): Promise<User> {
  const result = await query<User>(
    `INSERT INTO users (email, google_id, name, picture)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userData.email, userData.googleId, userData.name, userData.picture]
  );
  return result.rows[0];
}

export async function updateUser(
  userId: string,
  userData: Partial<{
    name: string | null;
    picture: string | null;
  }>
): Promise<User> {
  const result = await query<User>(
    `UPDATE users
     SET name = COALESCE($2, name),
         picture = COALESCE($3, picture),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [userId, userData.name, userData.picture]
  );
  return result.rows[0];
}

// OAuth token queries
export async function saveTokens(
  userId: string,
  tokens: OAuthTokens
): Promise<void> {
  const encryptedAccessToken = encryptToken(tokens.accessToken);
  const encryptedRefreshToken = encryptToken(tokens.refreshToken);
  const expiryDate = new Date(tokens.expiryDate);

  await query(
    `INSERT INTO oauth_tokens (user_id, encrypted_access_token, encrypted_refresh_token, token_expiry)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, provider)
     DO UPDATE SET
       encrypted_access_token = EXCLUDED.encrypted_access_token,
       encrypted_refresh_token = EXCLUDED.encrypted_refresh_token,
       token_expiry = EXCLUDED.token_expiry,
       updated_at = NOW()`,
    [userId, encryptedAccessToken, encryptedRefreshToken, expiryDate]
  );
}

export async function getTokens(userId: string): Promise<OAuthTokens | null> {
  const result = await query<{
    encrypted_access_token: string;
    encrypted_refresh_token: string;
    token_expiry: Date;
  }>(
    'SELECT encrypted_access_token, encrypted_refresh_token, token_expiry FROM oauth_tokens WHERE user_id = $1 AND provider = $2',
    [userId, 'google']
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    accessToken: decryptToken(row.encrypted_access_token),
    refreshToken: decryptToken(row.encrypted_refresh_token),
    expiryDate: new Date(row.token_expiry).getTime(),
  };
}

export async function deleteUserTokens(userId: string): Promise<void> {
  await query('DELETE FROM oauth_tokens WHERE user_id = $1', [userId]);
}

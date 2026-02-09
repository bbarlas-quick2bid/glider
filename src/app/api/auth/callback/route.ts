// Handle Google OAuth callback

import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { getTokensFromCode, getUserInfo } from '@/lib/auth/oauth';
import { sessionOptions } from '@/lib/auth/session';
import {
  findUserByGoogleId,
  createUser,
  updateUser,
  saveTokens,
} from '@/lib/db/queries';
import { logger } from '@/lib/utils/logger';
import { AuthError } from '@/lib/utils/errors';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      logger.error('OAuth error:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?error=auth_failed`
      );
    }

    // Validate authorization code
    if (!code) {
      throw new AuthError('No authorization code provided', 'NO_CODE');
    }

    logger.info('Processing OAuth callback');

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);

    // Get user info from Google
    const userInfo = await getUserInfo(tokens.accessToken);

    // Find or create user in database
    let user = await findUserByGoogleId(userInfo.googleId);

    if (!user) {
      // Create new user
      logger.info('Creating new user:', userInfo.email);
      user = await createUser({
        email: userInfo.email,
        googleId: userInfo.googleId,
        name: userInfo.name,
        picture: userInfo.picture,
      });
    } else {
      // Update existing user info
      logger.info('Updating existing user:', userInfo.email);
      user = await updateUser(user.id, {
        name: userInfo.name,
        picture: userInfo.picture,
      });
    }

    // Save encrypted tokens to database
    await saveTokens(user.id, tokens);

    // Create session
    const session = await getIronSession(await cookies(), sessionOptions);
    session.user = {
      userId: user.id,
      email: user.email,
      isLoggedIn: true,
    };
    await session.save();

    logger.info('User authenticated successfully:', user.email);

    // Redirect to dashboard
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
  } catch (error) {
    logger.error('OAuth callback error:', error);

    // Redirect to home with error
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?error=auth_failed`
    );
  }
}

// utils/auth.ts

import { Amplify } from 'aws-amplify';

const userPoolId = process.env.USER_POOL_ID || "";
const userPoolClientId = process.env.USER_POOL_CLIENT_ID || "";
const identityPoolId = process.env.IDENTITY_POOL_ID || "";

if (!userPoolId || !userPoolClientId || !identityPoolId) {
  throw new Error('Missing required environment variables.');
}

Amplify.configure({
  Auth: {
    userPoolId,
    userPoolClientId,
    identityPoolId,
  },
});

export const signUp = async (email: string, password: string, fullName: string) => {
  try {
    return await Amplify.Auth.signUp({
      username: email,
      password,
      attributes: {
        email,
        name: fullName,
      },
    });
  } catch (error) {
    throw error instanceof Error ? new Error(error.message) : new Error('An unknown error occurred during sign up.');
  }
};

export async function signIn(email: string, password: string) {
  try {
    const user = await Amplify.Auth.signIn(email, password);
    return { isSignedIn: true, nextStep: user.challengeName };
  } catch (error) {
    if (error instanceof Error && 'name' in error) {
      switch (error.name) {
        case 'NotAuthorizedException':
          throw new Error('Incorrect email or password.');
        // Handle other cases...
      }
    }
    throw new Error('Authentication failed.');
  }
}

export async function signOutUser() {
  try {
    await signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    if (error instanceof Error) {
      throw new Error(`Sign out failed: ${error.message}`, { cause: error });
    } else {
      throw new Error('An unknown error occurred during sign out.');
    }
  }
}

export async function getCurrentAuthenticatedUser() {
  try {
    const user = await getCurrentUser();
    const attributes = await fetchUserAttributes();
    return {
      username: user.username,
      userId: user.userId,
      fullName: attributes.name || user.username,
      email: attributes.email || user.username,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to get current user: ${error.message}`, { cause: error });
    } else {
      throw new Error('An unknown error occurred while getting the current user.');
    }
  }
}
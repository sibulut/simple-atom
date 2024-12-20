// utils/auth.ts

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

import { Amplify } from 'aws-amplify';
import { signUp as amplifySignUp, signIn as amplifySignIn, signOut as amplifySignOut, getCurrentUser, fetchUserAttributes } from '@aws-amplify/auth';
import { type SignUpOutput } from '@aws-amplify/auth';

const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;
const identityPoolId = process.env.NEXT_PUBLIC_IDENTITY_POOL_ID;

if (!userPoolId) {
    throw new Error('Missing AWS environment variable: USER_POOL_ID.');
}
if (!userPoolClientId) {
    throw new Error('Missing AWS environment variable: USER_POOL_CLIENT_ID.');
}
if (!identityPoolId) {
    throw new Error('Missing AWS environment variable: IDENTITY_POOL_ID.');
}

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,
      identityPoolId,
    },
  },
});

export type { SignUpOutput };

export const signUp = async (email: string, password: string, fullName: string): Promise<SignUpOutput> => {
  try {
    const signUpOutput = await amplifySignUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          name: fullName,
        },
      },
    });
    return signUpOutput;
  } catch (error) {
    throw error instanceof Error ? new Error(error.message) : new Error('An unknown error occurred during sign up.');
  }
};

export async function signIn(email: string, password: string): Promise<{ isSignedIn: boolean; nextStep?: string }> {
  try {
    const { isSignedIn, nextStep } = await amplifySignIn({ username: email, password });
    const nextStepString = typeof nextStep === 'string' ? nextStep : nextStep?.toString();
    return { isSignedIn, nextStep: nextStepString };
  } catch (error) {
    if (error instanceof Error && 'name' in error) {
      switch (error.name) {
        case 'NotAuthorizedException':
          throw new Error('Incorrect email or password.');
        case 'UserNotFoundException':
          throw new Error('User does not exist.');
        case 'UserNotConfirmedException':
          throw new Error('User is not confirmed. Please confirm your account.');
        default:
          throw new Error(`Authentication failed: ${error.message}`);
      }
    }
    throw new Error('Authentication failed.');
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await amplifySignOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error instanceof Error ? new Error(`Sign out failed: ${error.message}`) : new Error('An unknown error occurred during sign out.');
  }
}

export async function getCurrentAuthenticatedUser() {
  try {
    const { username, userId } = await getCurrentUser();
    const attributes = await fetchUserAttributes();
    
    return {
      username,
      userId,
      fullName: attributes.name || username,
      email: attributes.email || username,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error instanceof Error ? new Error(`Failed to get current user: ${error.message}`) : new Error('An unknown error occurred while getting the current user.');
  }
}
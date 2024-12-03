// utils/auth.ts

import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from '@aws-amplify/auth/cognito';
import { signUp as amplifySignUp, SignUpOutput } from '@aws-amplify/auth';

const userPoolId = process.env.USER_POOL_ID || '';
const userPoolClientId = process.env.USER_POOL_CLIENT_ID || '';
const identityPoolId = process.env.IDENTITY_POOL_ID || '';

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
    const { isSignedIn, nextStep } = await Amplify.Auth.signIn({ username: email, password });
    return { isSignedIn, nextStep };
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
    await Amplify.Auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error instanceof Error ? new Error(`Sign out failed: ${error.message}`) : new Error('An unknown error occurred during sign out.');
  }
}

export async function getCurrentAuthenticatedUser() {
  try {
    const { username, userId, signInDetails } = await Amplify.Auth.getCurrentUser();
    const attributes = await cognitoUserPoolsTokenProvider.getTokens();
    const attributeMap = attributes.accessToken.payload;

    return {
      username,
      userId,
      fullName: attributeMap.name || username,
      email: attributeMap.email || username,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error instanceof Error ? new Error(`Failed to get current user: ${error.message}`) : new Error('An unknown error occurred while getting the current user.');
  }
}
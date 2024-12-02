// utils/auth.ts

import { Amplify } from 'aws-amplify';
import { signUp as amplifySignUp, signIn as amplifySignIn, signOut, getCurrentUser, fetchUserAttributes, AuthUser, SignUpOutput } from 'aws-amplify/auth';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.USER_POOL_ID,
      userPoolClientId: process.env.USER_POOL_CLIENT_ID,
      identityPoolId: process.env.IDENTITY_POOL_ID,
    }
  },
});

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
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('An unknown error occurred during sign up.');
    }
  }
};

export async function signIn(email: string, password: string) {
  try {
    const { isSignedIn, nextStep } = await amplifySignIn({ username: email, password });
    return { isSignedIn, nextStep };
  } catch (error) {
    console.error('Error signing in:', error);
    if (error instanceof Error && 'name' in error) {
      switch (error.name) {
        case 'NotAuthorizedException':
          throw new Error('Incorrect email or password.');
        case 'UserNotFoundException':
          throw new Error('User does not exist.');
        case 'UserNotConfirmedException':
          throw new Error('User is not confirmed. Please confirm your account.');
        case 'InvalidParameterException':
          throw new Error('Invalid parameters provided. Please check your input.');
        default:
          throw new Error(`Authentication failed: ${error.message}`);
      }
    } else {
      throw new Error('An unknown error occurred during authentication.');
    }
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
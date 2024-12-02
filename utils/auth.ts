// utils/auth.ts ..

import { Amplify } from 'aws-amplify';

const userPoolId = process.env.USER_POOL_ID || "";
const userPoolClientId = process.env.USER_POOL_CLIENT_ID || "";
const identityPoolId = process.env.IDENTITY_POOL_ID || "";

const missingVars = [];
if (!userPoolId) missingVars.push('USER_POOL_ID');
if (!userPoolClientId) missingVars.push('USER_POOL_CLIENT_ID');
if (!identityPoolId) missingVars.push('IDENTITY_POOL_ID');
if (missingVars.length) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
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

export async function signIn(email: string, password: string): Promise<{ isSignedIn: boolean; nextStep?: string }> {
  try {
    const user = await Amplify.Auth.signIn(email, password);
    return { isSignedIn: true, nextStep: user.challengeName };
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
    const user = await Amplify.Auth.currentAuthenticatedUser();
    const attributes = await Amplify.Auth.userAttributes(user);
    const attributeMap = attributes.reduce((acc, { Name, Value }) => ({ ...acc, [Name]: Value }), {});

    return {
      username: user.username,
      userId: user.attributes.sub,
      fullName: attributeMap.name || user.username,
      email: attributeMap.email || user.username,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error instanceof Error ? new Error(`Failed to get current user: ${error.message}`) : new Error('An unknown error occurred while getting the current user.');
  }
}
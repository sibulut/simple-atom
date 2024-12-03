// app/sign.tsx

'use client'

require('dotenv').config({ path: '.env.production' });

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp, signOutUser, getCurrentAuthenticatedUser, type SignUpOutput } from '../utils/auth';
import { getUserMetadata, updateUserMetadata } from '../utils/dynamodb';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAndSignOut = async () => {
      try {
        const currentUser = await getCurrentAuthenticatedUser();
        if (currentUser) {
          await signOutUser();
        }
      } catch (error) {
        // If there's no current user, getCurrentAuthenticatedUser will throw an error
        // Ignore this error as it means there's no user to sign out
      } finally {
        setIsLoading(false);
      }
    };

    checkAndSignOut();
  }, []);

  const validateForm = () => {
    if (!email || !password || (isSignUp && !name)) {
      setError('Please fill in all fields.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isSignUp) {
        const signUpOutput: SignUpOutput = await signUp(email, password, name);
        
        // Check if further action is needed (e.g., confirmation)
        if (signUpOutput.nextStep.signUpStep !== 'DONE') {
          setError(`Sign up requires further action: ${signUpOutput.nextStep.signUpStep}`);
          setIsLoading(false);
          return;
        }

        // If sign up is complete, proceed with sign in
        await signIn(email, password);

        // After successful sign in, update user metadata
        const currentUser = await getCurrentAuthenticatedUser();
        await updateUserMetadata(currentUser.userId, email, {
          user_name_str: email,
          userFullName: name
        });
      } else {
        await signIn(email, password);
      }

      // After successful authentication, try to get user metadata
      const currentUser = await getCurrentAuthenticatedUser();
      const userMetadata = await getUserMetadata(currentUser.userId, email);

      if (!userMetadata) {
        throw new Error('User metadata not found');
      }

      router.push('/videos');
    } catch (err) {
      console.error('Authentication error:', err);
      if (err instanceof Error) {
        setError(`Authentication failed: ${err.message}`);
      } else {
        setError('An unknown error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Create an account' : 'Sign in to your account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            {isSignUp && (
              <div className="mb-4">
                <label htmlFor="name" className="sr-only">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="mb-4">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
        <div className="text-center mt-4 text-sm text-gray-600">Sign up/in is managed by Amazon Cognito user pool.</div>
      </div>
    </div>
  );
}
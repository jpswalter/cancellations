// file: app/login/login-form.tsx
'use client';
import { Button } from '@/components/ui/button';
import { Checkbox, CheckboxField } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Label } from '@/components/ui/fieldset';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Get the ID token
      const idToken = await userCredential.user.getIdToken();

      // Send the ID token to our API to create a session cookie
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      setError('');
      router.push('/overview');
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Invalid email or password or session creation failed.');
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg bg-white shadow max-w-lg w-full">
      <div className="space-y-4 p-8 xl:p-16">
        <div className="flex flex-col text-left">
          <div className="mb-1 text-4xl font-bold">Sign in</div>
          <div className="text-large text-gray-500">
            Enter your email and password to sign in
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <hr className="h-px flex-1 border-0 bg-gray-300" />
        </div>

        <form className="space-y-4" onSubmit={handleSignIn}>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="focus:ring-primary-600 focus:border-primary-600 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900"
              placeholder="name@company.com"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              className="focus:ring-primary-600 focus:border-primary-600 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <CheckboxField>
                  <Checkbox className="text-blue-600" />
                  <Label>Remember me</Label>
                </CheckboxField>
              </div>
            </div>
            <Link
              href="/reset-password"
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button
            className="w-full text-blue-600"
            disabled={!email || !password}
            type="submit"
            loading={loading}
          >
            Login with Email
          </Button>
          {error && <p className="text-sm font-light text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginForm;

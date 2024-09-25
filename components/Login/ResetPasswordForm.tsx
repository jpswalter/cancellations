'use client';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useSearchParams } from 'next/navigation';

const ResetPasswordForm: React.FC = () => {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [showLoginButton, setShowLoginButton] = useState(false);

  useEffect(() => {
    if (oobCode && mode === 'resetPassword') {
      verifyPasswordResetCode(auth, oobCode as string)
        .then(() => {
          setIsCodeValid(true);
        })
        .catch(error => {
          console.error('Invalid or expired reset code:', error);
          setMessage('Invalid or expired reset code.');
        });
    }
  }, [oobCode, mode]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    try {
      setLoading(true);
      await confirmPasswordReset(auth, oobCode as string, newPassword);
      setMessage('Password has been reset successfully.');
      // Optionally redirect the user or provide further instructions
      setShowLoginButton(true);
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage('Error resetting password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setMessage('Check your email for password reset instructions.');
      // Optionally redirect the user or provide further instructions
    } catch (error) {
      console.error('Error sending password reset email:', error);
      setMessage('Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (oobCode && isCodeValid) {
    return (
      <div className="rounded-lg bg-white shadow max-w-lg w-full">
        <div className="space-y-4 p-8 xl:p-16">
          <div className="flex flex-col text-left">
            <div className="mb-1 text-4xl font-bold">Reset password</div>
            <div className="text-large text-gray-500">
              Enter your new password
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <hr className="h-px flex-1 border-0 bg-gray-300" />
          </div>

          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                New Password
              </label>
              <input
                type="password"
                name="new-password"
                id="new-password"
                className="focus:ring-primary-600 focus:border-primary-600 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900"
                placeholder="New password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Confirm Password
              </label>
              <input
                type="password"
                name="confirm-password"
                id="confirm-password"
                className="focus:ring-primary-600 focus:border-primary-600 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900"
                placeholder="Confirm new password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
            {!showLoginButton && (
              <Button
                className="w-full"
                disabled={loading || showLoginButton}
                type="submit"
                loading={loading}
              >
                Reset Password
              </Button>
            )}
            {message && (
              <p className="font-bold text-base text-center text-gray-500">
                {message}
              </p>
            )}
            {showLoginButton && (
              <p className="font-bold text-base text-center text-gray-500">
                <Button href="/login" className="w-full" color="dark/white">
                  Login
                </Button>
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white shadow max-w-lg w-full">
      <div className="space-y-4 p-8 xl:p-16">
        <div className="flex flex-col text-left">
          <div className="mb-1 text-4xl font-bold">Reset password</div>
          <div className="text-large text-gray-500">Enter your email</div>
        </div>
        <div className="flex items-center space-x-2">
          <hr className="h-px flex-1 border-0 bg-gray-300" />
        </div>

        <form className="space-y-4" onSubmit={handleSendResetEmail}>
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
          <Button
            className="w-full"
            disabled={loading}
            type="submit"
            loading={loading}
          >
            Send Reset Email
          </Button>
          {message && (
            <p className="font-bold text-base text-gray-500">{message}</p>
          )}
          <p className="text-sm font-light text-gray-500">
            Remembered your password?{' '}
            <span className="text-blue-600 font-medium hover:underline">
              <Link href="/login">Login</Link>
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;

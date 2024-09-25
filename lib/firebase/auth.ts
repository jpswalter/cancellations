import { getAuth, fetchSignInMethodsForEmail, AuthError } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './config';

// Initialize Firebase once
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Simple email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function checkExistingUsers(emails: string[]): Promise<{
  existingEmails: string[];
  invalidEmails: string[];
  errors: string[];
}> {
  const existingEmails: string[] = [];
  const invalidEmails: string[] = [];
  const errors: string[] = [];

  for (const email of emails) {
    if (!emailRegex.test(email)) {
      invalidEmails.push(email);
      continue;
    }

    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        existingEmails.push(email);
      }
    } catch (error) {
      if (error instanceof Error) {
        const authError = error as AuthError;
        if (authError.code === 'auth/invalid-email') {
          invalidEmails.push(email);
        } else {
          errors.push(`Error checking email ${email}: ${authError.message}`);
        }
      } else {
        errors.push(`Unexpected error checking email ${email}`);
      }
      console.error(`Error checking email ${email}:`, error); // Debug log
    }
  }

  return { existingEmails, invalidEmails, errors };
}

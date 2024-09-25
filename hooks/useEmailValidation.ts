import { useState, useEffect } from 'react';
import { checkExistingUsers } from '@/lib/firebase/auth';
import { useDebounce } from './useDebounce';

interface EmailValidationResult {
  existingEmails: string[];
  invalidEmails: string[];
  errors: string[];
}

export function useEmailValidation(emails: string, delay: number = 500) {
  const [emailError, setEmailError] = useState<string | null>(null);
  const [invalidEmails, setInvalidEmails] = useState<string[]>([]);
  const debouncedEmails = useDebounce(emails, delay);

  useEffect(() => {
    const validateEmails = async () => {
      if (debouncedEmails) {
        const inputEmails = debouncedEmails
          .split(',')
          .map(email => email.trim())
          .filter(email => email !== '');

        if (inputEmails.length > 0) {
          try {
            const result: EmailValidationResult =
              await checkExistingUsers(inputEmails);

            if (result.existingEmails.length > 0) {
              setEmailError(
                `User${result.existingEmails.length > 1 ? 's' : ''}: ${
                  result.existingEmails.length > 1
                    ? result.existingEmails.join(', ')
                    : result.existingEmails[0]
                } already exist in ProxyLink, please use another email(s)`,
              );
            } else {
              setEmailError(null);
            }

            setInvalidEmails(result.invalidEmails);

            if (result.errors.length > 0) {
              console.error(
                'Errors occurred while checking emails:',
                result.errors,
              );
            }
          } catch (error) {
            console.error('Error checking emails:', error);
            setEmailError('An unexpected error occurred. Please try again.');
          }
        } else {
          setEmailError(null);
          setInvalidEmails([]);
        }
      }
    };

    validateEmails();
  }, [debouncedEmails]);

  return { emailError, invalidEmails };
}

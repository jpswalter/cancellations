'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { parseErrorMessage } from '@/utils/general';
import Link from 'next/link';

const ContactForm: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          email,
          company,
          message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      setSuccess(true);
      // Reset form fields
      setFirstName('');
      setLastName('');
      setPhone('');
      setEmail('');
      setCompany('');
      setMessage('');
    } catch (error) {
      setError(parseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="w-full flex items-center gap-2">
        <div className="w-1/2">
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name*
          </label>
          <Input
            id="firstName"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="w-1/2">
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name*
          </label>
          <Input
            id="lastName"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700"
        >
          Phone
        </label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email*
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label
          htmlFor="company"
          className="block text-sm font-medium text-gray-700"
        >
          Company
        </label>
        <Input
          id="company"
          value={company}
          onChange={e => setCompany(e.target.value)}
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700"
        >
          Message*
        </label>
        <Textarea
          id="message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
        />
      </div>
      <Button
        color="blue"
        type="submit"
        disabled={loading}
        className="h-12 w-full"
      >
        {loading ? 'Sending...' : 'Send'}
      </Button>
      {error && <p className="text-sm font-light text-red-500">{error}</p>}
      {success && (
        <p className="text-sm font-light text-green-500">
          Message sent successfully!
        </p>
      )}
      <p className="text-sm font-light text-gray-500 mt-2">
        In submitting this form, you agree to receive information from ProxyLink
        related to our products, events, and special offers. You can unsubscribe
        from such messages at any time. We never sell your data, and we value
        your privacy choices. Please see our{' '}
        <Link href="/privacy-policy" className="text-amber-500">
          Privacy Policy
        </Link>{' '}
        for more information.
      </p>
    </form>
  );
};

export default ContactForm;

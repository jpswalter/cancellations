import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import nodemailer from 'nodemailer';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function sendEmailInvitation({
  sendTo,
  isAdmin,
  invitedBy,
}: {
  sendTo: string;
  isAdmin: boolean;
  invitedBy: string;
}) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Missing email credentials');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const subject = isAdmin
    ? 'You are invited to lead on ProxyLink!'
    : 'You are invited to join ProxyLink!';

  const text = isAdmin
    ? `Hello,

You have been invited by ${invitedBy} to join ProxyLink as an admin. As an admin, you will have access to manage your organization's settings and users.

Please log in to your account to get started.

Best regards,
The ProxyLink Team`
    : `Hello,

You have been invited by ${invitedBy} to join ProxyLink. As a user, you will have access to the features and services provided by your organization.

Please log in to your account to get started.

Best regards,
The ProxyLink Team`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: sendTo,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
}

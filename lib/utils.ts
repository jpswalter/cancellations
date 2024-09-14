import nodemailer from 'nodemailer';
import { generateInvitationToken } from './jwt/utils';
import { TenantType } from './db/schema';

export async function sendEmailInvitation({
  sendTo,
  isAdmin,
  invitedBy,
  tenantType,
  tenantName,
  tenantId,
  name,
}: {
  sendTo: string;
  isAdmin: boolean;
  invitedBy: string;
  tenantType: TenantType;
  tenantName: string;
  tenantId: string;
  name: string;
}) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Missing email credentials');
  }

  const invitationToken = generateInvitationToken({
    tenantType,
    tenantName,
    tenantId,
    email: sendTo,
    isAdmin,
    name,
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let baseUrl: string;
  if (process.env.VERCEL_ENV === 'production') {
    baseUrl = 'https://proxylink.co';
  } else if (process.env.VERCEL_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`;
  } else {
    baseUrl = 'http://localhost:3000';
  }

  const invitationLink = `${baseUrl}/signup?token=${invitationToken}`;

  const subject = isAdmin
    ? 'You are invited to lead on ProxyLink!'
    : 'You are invited to join ProxyLink!';

  const text = isAdmin
    ? `Hello${name ? ` ${name}` : ''},

You have been invited by ${invitedBy} to join ProxyLink as an admin. As an admin, you will have access to manage your organization's settings and users.

Please follow this link to set your password and get started: ${invitationLink}. It is valid for 24 hours.

Best regards,
The ProxyLink Team`
    : `Hello${name ? ` ${name}` : ''},

You have been invited by ${invitedBy} to join ProxyLink. As a user, you will have access to the features and services provided by your organization.

Please follow this link to set your password and get started: ${invitationLink}. It is valid for 24 hours.

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

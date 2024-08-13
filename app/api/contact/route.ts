import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
  }

  console.log(
    'Sending email with this credentials:',
    process.env.EMAIL_USER,
    process.env.EMAIL_PASS,
  );

  const { firstName, lastName, phone, email, company, message } =
    await request.json();

  // Create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'john@proxylink.co',
    subject: 'New Contact Form Submission on ProxyLink',
    text: `
      New contact form submission:
      
      First Name: ${firstName}
      Last Name: ${lastName}
      Phone: ${phone || 'Not provided'}
      Email: ${email}
      Company: ${company || 'Not provided'}
      
      Message:
      ${message}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json(
      { message: 'Messaage sent successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json(
      { error: 'Failed to send the message' },
      { status: 500 },
    );
  }
}

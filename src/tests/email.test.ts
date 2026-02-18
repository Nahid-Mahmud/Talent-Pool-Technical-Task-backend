import nodemailer from 'nodemailer';
import path from 'path';
import ejs from 'ejs';
import envVariables from '../config/env';

describe('Email Service', () => {
  it('should have a working transporter', async () => {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    const result = await transporter.verify();
    // nodemailer verify returns true if successful
    expect(result).toBe(true);
  });

  it('should send an email using sendEmail utility', async () => {
    // Render template
    const templatePath = path.join(
      __dirname,
      '../utils/templates/verifyAccount.ejs'
    );
    const html = await ejs.renderFile(templatePath, {
      userName: 'Test User',
      verificationUrl: 'https://example.com/verify',
    });

    // Send email using envVariables
    const transporter = nodemailer.createTransport({
      host: envVariables.EMAIL_SENDER.SMTP_HOST,
      port: Number(envVariables.EMAIL_SENDER.SMTP_PORT),
      secure: false,
      auth: {
        user: envVariables.EMAIL_SENDER.SMTP_USER,
        pass: envVariables.EMAIL_SENDER.SMTP_PASS,
      },
    });
    const info = await transporter.sendMail({
      from: envVariables.EMAIL_SENDER.SMTP_FROM,
      to: envVariables.EMAIL_SENDER.SMTP_FROM,
      subject: 'Test Email',
      html,
    });
    expect(info.messageId).toBeDefined();
    expect(info.accepted).toContain(envVariables.EMAIL_SENDER.SMTP_FROM);
  });
});

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(to, token, customContent = null) {
  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify?token=${token}`;
  
  const defaultContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568; text-align: center;">Welcome to Pulse Clinic!</h2>
      <p style="color: #4a5568;">Thank you for registering with us. Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #4299e1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
      </div>
      <p style="color: #4a5568;">If the button doesn't work, you can also click on the link below or copy and paste it into your browser:</p>
      <p><a href="${verificationLink}" style="color: #4299e1;">${verificationLink}</a></p>
      <p style="color: #718096; font-size: 14px; margin-top: 30px;">This link is valid for 24 hours. If you didn't request this email, please ignore it.</p>
    </div>
  `;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Email Verification - Pulse Clinic',
    html: customContent || defaultContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(to, token) {
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Password Reset Request - Pulse Clinic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5568; text-align: center;">Password Reset Request</h2>
        <p style="color: #4a5568;">We received a request to reset the password for your Pulse Clinic account.</p>
        <p style="color: #4a5568;">Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #e53e3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #4a5568;">If the button doesn't work, you can also click on the link below or copy and paste it into your browser:</p>
        <p><a href="${resetLink}" style="color: #e53e3e;">${resetLink}</a></p>
        <div style="margin-top: 30px; padding: 20px; background-color: #fff5f5; border-left: 4px solid #e53e3e;">
          <h3 style="color: #2d3748; margin-top: 0; font-size: 16px;">Important Security Information:</h3>
          <ul style="color: #4a5568; margin: 10px 0; padding-left: 20px;">
            <li>This link is valid for 1 hour only</li>
            <li>If you didn't request this password reset, please ignore this email</li>
            <li>Your password will not be changed unless you click the link and create a new password</li>
          </ul>
        </div>
        <p style="color: #718096; font-size: 14px; margin-top: 30px;">If you're having trouble with your account, please contact our support team.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

export default { sendVerificationEmail, sendPasswordResetEmail }; 
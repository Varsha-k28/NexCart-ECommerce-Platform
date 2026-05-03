const nodemailer = require('nodemailer')

const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

const sendOTPEmail = async (toEmail, otp, userName) => {
  const transporter = createTransporter()

  const mailOptions = {
    from:    `"NexCart" <${process.env.GMAIL_USER}>`,
    to:      toEmail,
    subject: 'Your NexCart Password Reset OTP',
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #6c63ff, #574fd6); padding: 32px 40px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 800;">🛍️ NexCart</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Password Reset Request</p>
        </div>
        <div style="padding: 40px;">
          <p style="color: #1a1a2e; font-size: 16px; margin: 0 0 8px;">Hi <strong>${userName}</strong>,</p>
          <p style="color: #4a4a6a; font-size: 14px; line-height: 1.6; margin: 0 0 28px;">
            We received a request to reset your password. Use the OTP below to proceed.
            This code is valid for <strong>10 minutes</strong>.
          </p>
          <div style="background: #f0eeff; border: 2px dashed #6c63ff; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;">
            <p style="color: #6c63ff; font-size: 13px; font-weight: 600; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
            <div style="font-size: 42px; font-weight: 800; color: #1a1a2e; letter-spacing: 12px;">${otp}</div>
          </div>
          <p style="color: #8888aa; font-size: 13px; line-height: 1.6; margin: 0;">
            ⚠️ If you didn't request this, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
        <div style="background: #f7f7fb; padding: 20px 40px; text-align: center; border-top: 1px solid #e8e8f0;">
          <p style="color: #8888aa; font-size: 12px; margin: 0;">© 2025 NexCart. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

const sendWelcomeEmail = async (toEmail, userName) => {
  const transporter = createTransporter()

  await transporter.sendMail({
    from:    `"NexCart" <${process.env.GMAIL_USER}>`,
    to:      toEmail,
    subject: 'Welcome to NexCart! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6c63ff, #574fd6); padding: 32px; text-align: center; border-radius: 16px 16px 0 0;">
          <h1 style="color: #fff; margin: 0;">Welcome to NexCart! 🛍️</h1>
        </div>
        <div style="padding: 32px; background: #fff; border-radius: 0 0 16px 16px; border: 1px solid #e8e8f0;">
          <p style="color: #1a1a2e; font-size: 16px;">Hi <strong>${userName}</strong>,</p>
          <p style="color: #4a4a6a; line-height: 1.6;">
            Your account has been created successfully. Start exploring thousands of products at unbeatable prices!
          </p>
          <a href="http://localhost:5173/products"
             style="display: inline-block; background: #6c63ff; color: #fff; padding: 12px 28px; border-radius: 50px; text-decoration: none; font-weight: 600; margin-top: 16px;">
            Start Shopping →
          </a>
        </div>
      </div>
    `,
  })
}

module.exports = { sendOTPEmail, sendWelcomeEmail }

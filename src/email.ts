import nodemailer from "nodemailer";
import "dotenv/config";

// Configure nodemailer transporter for Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tharunkumar6083@gmail.com",
    pass: process.env.SMTP_PASS, // IMPORTANT: Ensure .env has the Gmail App Password here
  },
});

import db from "./db.js";

export async function sendEmailToAllStudents(subject: string, text: string, html?: string) {
  try {
    console.log(`[Email Service] Sending email to all students: ${subject}`);
    const students = db.prepare("SELECT email FROM users WHERE role = 'student'").all() as any[];
    if (students.length === 0) return true;

    const bccList = students.map(s => s.email).join(', ');

    const info = await transporter.sendMail({
      from: '"CampusLink" <tharunkumar6083@gmail.com>',
      to: "tharunkumar6083@gmail.com", // send to ourselves, bcc students
      bcc: bccList,
      subject,
      text,
      html,
    });
    console.log("Bulk Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send bulk email:", error);
    return false;
  }
}

export async function sendEmailToUser(toEmail: string, subject: string, text: string, html?: string) {
  try {
    console.log(`[Email Service] Sending email to ${toEmail}: ${subject}`);
    const info = await transporter.sendMail({
      from: '"CampusLink" <tharunkumar6083@gmail.com>',
      to: toEmail,
      subject,
      text,
      html,
    });
    console.log("Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send email to user:", error);
    return false;
  }
}

export async function sendOTPEmail(toEmail: string, otp: string) {
  try {
    const info = await transporter.sendMail({
      from: '"CampusLink" <tharunkumar6083@gmail.com>',
      to: toEmail,
      subject: "Your CampusLink Registration OTP",
      text: `Your One-Time Password (OTP) for CampusLink registration is: ${otp}\n\nThis OTP will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>CampusLink Registration</h2>
          <p>Your One-Time Password (OTP) is: <strong>${otp}</strong></p>
          <p>This OTP will expire in 10 minutes. Please do not share this with anyone.</p>
        </div>
      `,
    });
    console.log("OTP Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return false;
  }
}

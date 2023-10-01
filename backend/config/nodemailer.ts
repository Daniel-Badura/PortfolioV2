import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// create transporter
export const transporter: Transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// send email
export const mailOptions = {
  from: process.env.SMTP_USER,
  to: "" as string,
  subject: "Email Confirmation",
  text: "" as string,
};

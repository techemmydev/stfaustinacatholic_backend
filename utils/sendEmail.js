import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"St. Faustina Parish" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    // Don't throw - let the request succeed even if email fails
  }
};

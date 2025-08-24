import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';

const sendMail = async (options) => {
  const mailGenerator= new Mailgen({
    theme: 'default',
    product: {
      // Appears in header & footer of e-mails
      name: "Task Manager",
      link: "https://taskmanager.app",
      // Optional product logo
      // logo: 'https://mailgen.js/img/logo.png'
    },
  });

   // Generate the plaintext version of the e-mail (for clients that do not support HTML)
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

  // Generate an HTML email with the provided contents
  const emailHtml = mailGenerator.generate(options.mailgenContent);

// Create a nodemailer transporter instance which is responsible to send a mail

const transporter=nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
})

const mail = {
    from: "mail.taskmanager@example.com", // We can name this anything. The mail will go to your Mailtrap inbox
    to: options.email, // receiver's mail
    subject: options.subject, // mail subject
    text: emailTextual, // mailgen content textual variant
    html: emailHtml, // mailgen content html variant
  };


  try {
    await transporter.sendMail(mail);
    return { success: true, message: `Email sent to ${options.email}` };
  } catch (error) {
    console.error("Email service failed silently. Check your MAILTRAP credentials.");
    console.error("Error: ", error);
    return { success: false, error: error.message };
  }
};


const emailVerificationMailgenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to our app! We're very excited to have you on board.",
      action: {
        instructions:
          "To verify your email please click on the following button:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Verify your email",
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};



export {sendMail,emailVerificationMailgenContent}
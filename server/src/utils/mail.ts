import nodemailer from "nodemailer";

const options = {
  host: process.env.SMTP_HOST || "smtp.mailtrap.io",
  port: Number(process.env.SMTP_PORT) || 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};

const transport = nodemailer.createTransport(options);

class MailService {
  async sendActivationMail(to, link) {
    transport.sendMail({
      from: process.env.SMTP_USER!,
      to,
      text: "",
      subject: "Активация аккаунта на ",
      html: `
                  <div>
                      <h1>Для активации перейдите по ссылке</h1>
                      <a href="${link}">${link}</a>
                  </div>
              `,
    });
  }
}
export default new MailService();

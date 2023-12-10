/* eslint-disable import/no-useless-path-segments */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require('nodemailer');
const Twig = require('twig');
const { htmlToText } = require('html-to-text');
const AppError = require('../utils/appError');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Natours <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    Twig.renderFile(
      `${__dirname}/../public/emails/${template}.twig`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
      async (err, html) => {
        if (err) {
          return new AppError(err, 500);
        }
        const mailOptions = {
          from: this.from,
          to: this.to,
          subject,
          html,
          text: htmlToText(html),
        };

        await this.newTransport().sendMail(mailOptions);
      },
    );
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to natours');
  }

  async sendPasswordReset() {
    await this.send('password', 'Password reset link [valid for 10 minutes]');
  }
};

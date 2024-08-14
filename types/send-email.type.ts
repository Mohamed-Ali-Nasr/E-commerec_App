import { Attachment } from "nodemailer/lib/mailer";

export type SendEmailParams = {
  to: string;
  subject: string;
  textMessage: string;
  htmlMessage: string;
  attachments?: Attachment[];
};

import nodemailer from "nodemailer";
import hbs, { NodemailerExpressHandlebarsOptions } from "nodemailer-express-handlebars";
import path from "path";

const email = process.env.EMAIL;
const pass = process.env.EMAIL_PASS;

export const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // Set to false for TLS, which works with port 587
  auth: {
    user: email,
    pass,
  },
});

const handlebarOptions: NodemailerExpressHandlebarsOptions = {
  viewEngine: {
    extname: ".hbs", // Note the correct spelling (extname, not extName)
    partialsDir: path.resolve("./emailTemplates/"),
    defaultLayout: false,
  },
  viewPath: path.resolve("./emailTemplates/"),
  extName: ".hbs",
};

transporter.use("compile", hbs(handlebarOptions));

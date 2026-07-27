const nodemailer = require('nodemailer');
const nodemailerExpressHandlebars = require('nodemailer-express-handlebars').default;
const handlebars = require('express-handlebars');
const path = require('path');
const config = require('../config');



function setUpViewEngine(transporter){
    const viewEngine = handlebars.create({defaultLayout: false});
    const compiler = nodemailerExpressHandlebars({
        viewEngine: viewEngine,
        viewPath: path.join(__dirname, '../views'),
        extName: '.hbs'
    });
    transporter.use('compile', compiler);
}


function createTransport() {
    const transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure, // true for 465, false for other ports (STARTTLS)
        auth: {
            user: config.smtp.user,
            pass: config.smtp.pass
        }
    });
    setUpViewEngine(transporter);
    return transporter;
}


let transporter = null;


module.exports = {
    /**
     *
     * @param {object} mail
     * @param {string} mail.from - treated as a display name only; the real From
     *   address is always the authenticated SMTP account (SMTP_USER), since that's
     *   the only address most providers (Gmail included) will actually deliver from
     * @param {string} mail.to
     * @param {string} mail.subject
     * @param {string} mail.template - template name in 'views' directory
     * @param {object} mail.context - template data
     * @returns {Promise<void|Error>}
     */
    async send(mail){
        transporter = transporter || createTransport();
        const fromName = mail.from || 'TicketFlow';
        const info = await transporter.sendMail({
            ...mail,
            from: `"${fromName}" <${config.smtp.user}>`
        });
        console.log('Message sent: %s', info.messageId);
    }
};
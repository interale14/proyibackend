const nodemailer = require('nodemailer');

const mailTransport = nodemailer.createTransport(
    {
        service: 'gmail',
        auth:{
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    }
);

const mailSender = (to, subject, body) =>{
    const mailOptions = {
        "from": 'process.env.MAIL_USER',
        "to": to,
        "subject": subject,
        //"text": body,
        "html": body
    }

    mailTransport.sendMail(mailOptions, (err, info) =>{
        if (err){
            console.log(err);
        }else{
            console.log(`Mail sent ${info.response}`);
        }
    })
}

module.exports = mailSender;
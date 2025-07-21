import nodemailer from "nodemailer";

const sendEmail = async (to, subject, htmlcontent) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: `"AutoBrand" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html:htmlcontent,
    });
};

export default sendEmail;
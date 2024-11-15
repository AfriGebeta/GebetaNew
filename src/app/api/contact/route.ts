import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        const { name, email, subject, message } = await req.json();

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.NEXT_PUBLIC_EMAIL_USER,
                pass: process.env.NEXT_PUBLIC_EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'webgoat12@gmail.com',
            subject: `Contact Form: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; color: #333;">
                    <div style="background-color: #4CAF50; padding: 15px; border-radius: 5px 5px 0 0; text-align: center; color: white;">
                        <h2 style="margin: 0;">New Contact Form Submission</h2>
                    </div>
                    
                    <div style="padding: 20px; background-color: white; border-radius: 0 0 5px 5px; box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);">
                        <p style="margin: 0 0 10px;"><strong>Name:</strong> ${name}</p>
                        <p style="margin: 0 0 10px;"><strong>Email:</strong> ${email}</p>
                        <p style="margin: 0 0 10px;"><strong>Subject:</strong> ${subject}</p>
                        <p style="margin: 20px 0;"><strong>Message:</strong></p>
                        <div style="background-color: #f1f1f1; padding: 15px; border-radius: 5px; color: #555;">
                            ${message}
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #aaa;">
                        <p style="margin: 0;">This message was sent from your website's contact form.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}

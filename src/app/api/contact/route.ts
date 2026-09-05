//@ts-nocheck
export const dynamic = "force-dynamic";

function isValidSubmission({ name, email, phone, subject, message, company }) {
    //honeypot
    if (company) return false;

    if (!name || name.length < 2) return false;
    if (!subject || subject.length < 3) return false;
    if (!message || message.length < 10) return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;

    if (!phone || phone.length <= 4) return false;

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) return false;

    const wordCount = message.trim().split(/\s+/).length;
    if (wordCount < 3) return false;


    const randomStringRegex = /^[A-Za-z0-9]{10,}$/;
    if (
        randomStringRegex.test(subject) ||
        randomStringRegex.test(message)
    ) return false;

    return true;
}

export async function POST(req) {
    try {
        const { name, email, phone, subject, message, company } = await req.json();

        if (!isValidSubmission({ name, email, phone, subject, message, company })) {
            return new Response(JSON.stringify({ error: 'Invalid submission' }), {
                status: 400,
            });
        }

        const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
        const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            throw new Error('telegram credentials not configured');
        }


        const telegramMessage = `
 *New contact form submission*

    *Name:* ${name}
    *Email:* ${email}
    *Phone:* ${phone}
    *Subject:* ${subject}

    *Message:*
${message}
        `.trim();

        const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); //15 second

        try {
            const response = await fetch(telegramApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: telegramMessage,
                    parse_mode: 'Markdown',
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (!data.ok) {
                throw new Error(data.description || 'failed to send message')
            }
        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                throw new Error('api timeout - please check your network connection');
            }
            throw new Error(`api error: ${fetchError.message}`);
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
        });

    } catch (error) {
        console.error('telegram error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}

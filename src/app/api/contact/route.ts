//@ts-nocheck

export async function POST(req) {
    try {
        const { name, email, subject, message } = await req.json();

        const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
        const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            throw new Error('telegram credentials not configured');
        }


        const telegramMessage = `
 *New contact form submission*

    *Name:* ${name}
    *Email:* ${email}
    *Subject:* ${subject}

    *Message:*
${message}
        `.trim();

        const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

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
        });

        const data = await response.json();

        if (!data.ok) {
            throw new Error(data.description || 'failed to send message')
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

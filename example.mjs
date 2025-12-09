// Example usage for sendMessage
import { sendMessage } from '@eliware/discord-webhook';

const url = 'https://discord.com/api/webhooks/your-webhook-id/your-webhook-token';
const body = { content: 'Hello from discord-webhook!' };

try {
    const response = await sendMessage({ url, body });
    if (response.ok) {
        console.log('Message sent successfully!');
    } else {
        console.error('Failed to send message:', response.status, await response.text());
    }
} catch (err) {
    console.error('Error sending message:', err);
}

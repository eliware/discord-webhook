import { sendMessage } from "@eliware/discord-webhook";

sendMessage({ body: { content: "message" } });

// @ts-expect-error The sendMessage options argument is required.
sendMessage();

// @ts-expect-error The body property is required.
sendMessage({ url: "https://discord.com" });

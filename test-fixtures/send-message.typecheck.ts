import { sendMessage } from "@eliware/discord-webhook";

sendMessage({ body: { content: "message" } });

sendMessage();

// @ts-expect-error The body property is required.
sendMessage({ url: "https://discord.com" });

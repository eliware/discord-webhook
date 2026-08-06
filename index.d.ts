export interface DiscordEmbed { title?: string; description?: string; color?: number; fields?: Array<{ name: string; value: string; inline?: boolean }>; footer?: { text: string }; author?: { name: string }; timestamp?: string; }
export interface DiscordMessage { content?: string; username?: string; avatar_url?: string; tts?: boolean; embeds?: DiscordEmbed[]; allowed_mentions?: { parse?: string[]; users?: string[]; roles?: string[]; replied_user?: boolean }; files?: unknown[]; [key: string]: unknown; }
export interface SendMessageParams { body: DiscordMessage; url?: string; maxRetries?: number; fetchFn?: typeof fetch; timeoutMs?: number; signal?: AbortSignal; wait?: boolean; threadId?: string; threadName?: string; }
export declare const DISCORD_LIMITS: Readonly<{ content: 2000; embeds: 10; title: 256; description: 4096; fields: 25; fieldName: 256; fieldValue: 1024; footerText: 2048; authorName: 256; totalEmbedText: 6000; }>;
export declare function validateWebhookBody(body: DiscordMessage): true;
export declare function sendMessage(params?: SendMessageParams): Promise<Response>;

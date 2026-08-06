export interface DiscordEmbed { title?: string; description?: string; color?: number; fields?: Array<{ name: string; value: string; inline?: boolean }>; footer?: { text: string }; timestamp?: string; }
export interface DiscordMessage { content?: string; username?: string; avatar_url?: string; tts?: boolean; embeds?: DiscordEmbed[]; allowed_mentions?: { parse?: string[]; users?: string[]; roles?: string[]; replied_user?: boolean }; files?: unknown[]; [key: string]: unknown; }
export interface SendMessageParams { body: DiscordMessage; url?: string; maxRetries?: number; fetchFn?: typeof fetch; timeoutMs?: number; signal?: AbortSignal; wait?: boolean; threadId?: string; threadName?: string; }
export declare function sendMessage(params?: SendMessageParams): Promise<Response>;

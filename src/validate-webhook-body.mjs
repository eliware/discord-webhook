import { DISCORD_LIMITS } from "./limits.mjs";
import { validateEmbed } from "./payload/embed-validation.mjs";

/** Validate payloads against Discord limits before making a network request. */
export function validateWebhookBody(body) {
  if (body.content !== undefined && typeof body.content !== "string") {
    throw new Error("Discord webhook content must be a string.");
  }
  if (body.content !== undefined && body.content.length > DISCORD_LIMITS.content) {
    throw new Error(`Discord webhook content exceeds ${DISCORD_LIMITS.content} characters.`);
  }
  if (body.embeds !== undefined && !Array.isArray(body.embeds)) {
    throw new Error("Discord webhook embeds must be an array.");
  }
  const embeds = body.embeds ?? [];
  if (embeds.length > DISCORD_LIMITS.embeds) {
    throw new Error(`Discord webhook supports at most ${DISCORD_LIMITS.embeds} embeds.`);
  }
  let total = 0;
  for (const [index, embed] of embeds.entries()) {
    total += validateEmbed(embed, index);
  }
  if (total > DISCORD_LIMITS.totalEmbedText) {
    throw new Error(
      `Discord webhook embed text exceeds ${DISCORD_LIMITS.totalEmbedText} characters.`,
    );
  }
  const hasContent = body.content !== undefined && body.content.length > 0;
  const hasEmbeds = embeds.length > 0;
  const hasComponents = Array.isArray(body.components) && body.components.length > 0;
  const hasPoll = body.poll !== undefined && body.poll !== null;
  if (!hasContent && !hasEmbeds && !hasComponents && !hasPoll) {
    throw new Error("Discord webhook body must include content, embeds, components, or poll.");
  }
  return true;
}

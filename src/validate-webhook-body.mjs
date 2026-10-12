import { DISCORD_LIMITS } from "./limits.mjs";

const stringLength = (value) => (typeof value === "string" ? value.length : 0);

/** Validate payloads against Discord limits before making a network request. */
export function validateWebhookBody(body) {
  if (typeof body.content === "string" && body.content.length > DISCORD_LIMITS.content) {
    throw new Error(`Discord webhook content exceeds ${DISCORD_LIMITS.content} characters.`);
  }
  if (!Array.isArray(body.embeds)) return true;
  if (body.embeds.length > DISCORD_LIMITS.embeds) {
    throw new Error(`Discord webhook supports at most ${DISCORD_LIMITS.embeds} embeds.`);
  }
  for (const [index, embed] of body.embeds.entries()) {
    validateEmbed(embed, index);
  }
  return true;
}

function validateEmbed(embed, index) {
  if (!embed || typeof embed !== "object" || Array.isArray(embed)) {
    throw new Error(`Discord embed ${index + 1} must be an object.`);
  }
  const check = (value, limit, name) => {
    if (value !== undefined && typeof value !== "string") {
      throw new Error(`Discord embed ${index + 1} ${name} must be a string.`);
    }
    if (stringLength(value) > limit) {
      throw new Error(`Discord embed ${index + 1} ${name} exceeds ${limit} characters.`);
    }
  };
  check(embed.title, DISCORD_LIMITS.title, "title");
  check(embed.description, DISCORD_LIMITS.description, "description");
  check(embed.footer?.text, DISCORD_LIMITS.footerText, "footer text");
  check(embed.author?.name, DISCORD_LIMITS.authorName, "author name");
  validateFields(embed.fields, index, check);
  validateTotalText(embed, index);
}

function validateFields(fields, index, check) {
  if (!Array.isArray(fields)) return;
  if (fields.length > DISCORD_LIMITS.fields) {
    throw new Error(`Discord embed ${index + 1} supports at most ${DISCORD_LIMITS.fields} fields.`);
  }
  for (const [fieldIndex, field] of fields.entries()) {
    if (!field || typeof field !== "object") {
      throw new Error(`Discord embed ${index + 1} field ${fieldIndex + 1} must be an object.`);
    }
    check(field.name, DISCORD_LIMITS.fieldName, `field ${fieldIndex + 1} name`);
    check(field.value, DISCORD_LIMITS.fieldValue, `field ${fieldIndex + 1} value`);
  }
}

function validateTotalText(embed, index) {
  const total =
    stringLength(embed.title) +
    stringLength(embed.description) +
    stringLength(embed.footer?.text) +
    stringLength(embed.author?.name) +
    (embed.fields || []).reduce(
      (sum, field) => sum + stringLength(field.name) + stringLength(field.value),
      0,
    );
  if (total > DISCORD_LIMITS.totalEmbedText) {
    throw new Error(
      `Discord embed ${index + 1} text exceeds ${DISCORD_LIMITS.totalEmbedText} characters.`,
    );
  }
}

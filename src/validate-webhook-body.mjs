import { DISCORD_LIMITS } from "./limits.mjs";

const stringLength = (value) => (typeof value === "string" ? value.length : 0);

/** Validate payloads against Discord limits before making a network request. */
export function validateWebhookBody(body) {
  if (body.content !== undefined && typeof body.content !== "string") {
    throw new Error("Discord webhook content must be a string.");
  }
  if (body.content !== undefined && body.content.length > DISCORD_LIMITS.content) {
    throw new Error(`Discord webhook content exceeds ${DISCORD_LIMITS.content} characters.`);
  }
  if (body.embeds === undefined) return true;
  if (!Array.isArray(body.embeds)) {
    throw new Error("Discord webhook embeds must be an array.");
  }
  if (body.embeds.length > DISCORD_LIMITS.embeds) {
    throw new Error(`Discord webhook supports at most ${DISCORD_LIMITS.embeds} embeds.`);
  }
  let total = 0;
  for (const [index, embed] of body.embeds.entries()) {
    total += validateEmbed(embed, index);
  }
  if (total > DISCORD_LIMITS.totalEmbedText) {
    throw new Error(
      `Discord webhook embed text exceeds ${DISCORD_LIMITS.totalEmbedText} characters.`,
    );
  }
  return true;
}

function validateEmbed(embed, index) {
  if (!embed || typeof embed !== "object" || Array.isArray(embed)) {
    throw new Error(`Discord embed ${index + 1} must be an object.`);
  }
  validateOptionalObject(embed.footer, index, "footer");
  validateOptionalObject(embed.author, index, "author");
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
  return getTotalText(embed);
}

function validateOptionalObject(value, index, name) {
  if (value !== undefined && (!value || typeof value !== "object" || Array.isArray(value))) {
    throw new Error(`Discord embed ${index + 1} ${name} must be an object.`);
  }
}

function validateFields(fields, index, check) {
  if (fields === undefined) return;
  if (!Array.isArray(fields)) {
    throw new Error(`Discord embed ${index + 1} fields must be an array.`);
  }
  if (fields.length > DISCORD_LIMITS.fields) {
    throw new Error(`Discord embed ${index + 1} supports at most ${DISCORD_LIMITS.fields} fields.`);
  }
  for (const [fieldIndex, field] of fields.entries()) {
    if (!field || typeof field !== "object" || Array.isArray(field)) {
      throw new Error(`Discord embed ${index + 1} field ${fieldIndex + 1} must be an object.`);
    }
    check(field.name, DISCORD_LIMITS.fieldName, `field ${fieldIndex + 1} name`);
    check(field.value, DISCORD_LIMITS.fieldValue, `field ${fieldIndex + 1} value`);
  }
}

function getTotalText(embed) {
  return (
    stringLength(embed.title) +
    stringLength(embed.description) +
    stringLength(embed.footer?.text) +
    stringLength(embed.author?.name) +
    (embed.fields || []).reduce(
      (sum, field) => sum + stringLength(field.name) + stringLength(field.value),
      0,
    )
  );
}

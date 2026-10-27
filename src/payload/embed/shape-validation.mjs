import { DISCORD_LIMITS } from "../../limits.mjs";

export function validateEmbedShape(embed, index) {
  if (!embed || typeof embed !== "object" || Array.isArray(embed)) {
    throw new Error(`Discord embed ${index + 1} must be an object.`);
  }
  validateOptionalObject(embed.footer, index, "footer");
  validateOptionalObject(embed.author, index, "author");
  validateFieldsShape(embed.fields, index);
}

function validateOptionalObject(value, index, name) {
  if (value !== undefined && (!value || typeof value !== "object" || Array.isArray(value))) {
    throw new Error(`Discord embed ${index + 1} ${name} must be an object.`);
  }
}

function validateFieldsShape(fields, index) {
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
  }
}

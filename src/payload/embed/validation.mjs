import { DISCORD_LIMITS } from "../../limits.mjs";

export function validateEmbed(embed, index) {
  if (!embed || typeof embed !== "object" || Array.isArray(embed)) {
    throw new Error(`Discord embed ${index + 1} must be an object.`);
  }
  validateOptionalObject(embed.footer, index, "footer");
  validateOptionalObject(embed.author, index, "author");
  const check = (value, limit, name) => {
    if (value !== undefined && typeof value !== "string") {
      throw new Error(`Discord embed ${index + 1} ${name} must be a string.`);
    }
    if (typeof value === "string" && value.length > limit) {
      throw new Error(`Discord embed ${index + 1} ${name} exceeds ${limit} characters.`);
    }
  };
  check(embed.title, DISCORD_LIMITS.title, "title");
  check(embed.description, DISCORD_LIMITS.description, "description");
  check(embed.footer?.text, DISCORD_LIMITS.footerText, "footer text");
  check(embed.author?.name, DISCORD_LIMITS.authorName, "author name");
  validateFields(embed.fields, index, check);
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

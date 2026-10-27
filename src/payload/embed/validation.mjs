import { DISCORD_LIMITS } from "../../limits.mjs";
import { validateEmbedShape } from "./shape-validation.mjs";

export function validateEmbed(embed, index) {
  validateEmbedShape(embed, index);
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
  validateFieldText(embed.fields, index, check);
}

function validateFieldText(fields, index, check) {
  if (fields === undefined) return;
  for (const [fieldIndex, field] of fields.entries()) {
    check(field.name, DISCORD_LIMITS.fieldName, `field ${fieldIndex + 1} name`);
    check(field.value, DISCORD_LIMITS.fieldValue, `field ${fieldIndex + 1} value`);
  }
}

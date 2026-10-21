const stringLength = (value) => (typeof value === "string" ? value.length : 0);

export function getEmbedTextLength(embed) {
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

export function normalizeText(value) {
  if (typeof value !== 'string') return value;
  return value.trim().toUpperCase();
}

export function normalizeFormData(data, textFields) {
  const normalized = { ...data };
  textFields.forEach((field) => {
    if (normalized[field] !== undefined) {
      normalized[field] = normalizeText(normalized[field]);
    }
  });
  return normalized;
}
const CHAR_MAP = {
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  '"': "&quot;",
  "'": "&#39;",
};

function sanitizeText(value) {
  if (typeof value !== "string") {
    return value;
  }

  return value.replace(/[<>&"']/g, (char) => CHAR_MAP[char]);
}

function sanitizeObject(obj) {
  const clean = {};
  for (const key of Object.keys(obj)) {
    clean[key] = sanitizeText(obj[key]);
  }
  return clean;
}

module.exports = { sanitizeText, sanitizeObject };

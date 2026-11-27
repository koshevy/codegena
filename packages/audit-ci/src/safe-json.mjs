/**
 * @param {string} possibleJson
 * @return {object|string|number|boolean|any[]|null}
 */
function safeJsonParse(possibleJson) {
  try {
    return JSON.parse(possibleJson);
  }
  catch {
    return null;
  }
}

export {
  safeJsonParse,
};

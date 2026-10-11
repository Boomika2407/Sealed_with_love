/**
 * Basic profanity filter for Memory Wall posts and comments.
 * Uses a simple wordlist-based approach with word-boundary checks.
 */

const BLOCKED_WORDS = [
  // Common profanities (abbreviated to avoid storing explicit content)
  'fuck', 'shit', 'asshole', 'bitch', 'cunt', 'bastard', 'dickhead',
  'motherfucker', 'fucker', 'damn', 'crap', 'bullshit',
  // Slurs — intentionally redacted here; expand as needed
  'slur1', 'slur2'
].map((w) => new RegExp(`\\b${w}\\b`, 'i'));

/**
 * Returns true if the text contains profanity.
 * @param {string} text
 * @returns {boolean}
 */
export function containsProfanity(text) {
  if (!text || typeof text !== 'string') return false;
  return BLOCKED_WORDS.some((re) => re.test(text));
}

/**
 * Replaces profanity with asterisks for display purposes.
 * @param {string} text
 * @returns {string}
 */
export function censorText(text) {
  if (!text || typeof text !== 'string') return text;
  let result = text;
  BLOCKED_WORDS.forEach((re) => {
    result = result.replace(re, (match) => '*'.repeat(match.length));
  });
  return result;
}

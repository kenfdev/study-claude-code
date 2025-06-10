import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * Sanitize user input to prevent XSS attacks
 * Removes any HTML tags and dangerous content
 */
export function sanitizeInput(input: string): string {
  // Remove all HTML tags and return plain text
  return purify.sanitize(input, { ALLOWED_TAGS: [] });
}

/**
 * Validate and sanitize todo title
 * Ensures the title is safe and within reasonable limits
 */
export function sanitizeTodoTitle(title: string): string {
  // Trim whitespace
  let sanitized = title.trim();
  
  // Remove any HTML/script content
  sanitized = sanitizeInput(sanitized);
  
  // Limit length to prevent DoS
  const MAX_TITLE_LENGTH = 500;
  if (sanitized.length > MAX_TITLE_LENGTH) {
    sanitized = sanitized.substring(0, MAX_TITLE_LENGTH);
  }
  
  return sanitized;
}
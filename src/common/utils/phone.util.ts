/**
 * Canonical Saudi Phone Number Normalization Utility
 * Default Country: Saudi Arabia (+966)
 * Format: E.164 (+9665xxxxxxxx)
 */

export interface PhoneNormalizationResult {
  isValid: boolean;
  normalized: string;
  error?: string;
}

/**
 * Normalizes Saudi mobile phone numbers into the canonical E.164 format (+9665xxxxxxxx).
 * Handles supported legacy and user input formats:
 * - 565642556 -> +966565642556
 * - 0565642556 -> +966565642556
 * - 966565642556 -> +966565642556
 * - +966565642556 -> +966565642556
 * - +966 56 564 2556 -> +966565642556
 * - 00966565642556 -> +966565642556
 *
 * Rejects invalid non-Saudi formats or numbers with incorrect digit counts.
 */
export function normalizeSaudiPhone(input: string): PhoneNormalizationResult {
  if (!input || typeof input !== "string") {
    return {
      isValid: false,
      normalized: "",
      error: "رقم الجوال مطلوب",
    };
  }

  // Remove whitespace, hyphens, parentheses, dots
  let cleaned = input.trim().replace(/[\s\-\(\)\.]/g, "");

  // International 00 prefix -> +
  if (cleaned.startsWith("00966")) {
    cleaned = "+966" + cleaned.slice(5);
  } else if (cleaned.startsWith("966") && !cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  // Case 1: Starts with +966
  if (cleaned.startsWith("+966")) {
    let nationalPart = cleaned.slice(4);
    // If user wrote +96605...
    if (nationalPart.startsWith("0")) {
      nationalPart = nationalPart.slice(1);
    }
    if (/^5\d{8}$/.test(nationalPart)) {
      return { isValid: true, normalized: `+966${nationalPart}` };
    }
    return {
      isValid: false,
      normalized: "",
      error: "رقم الجوال السعودي غير صحيح. يجب أن يتكون من 9 أرقام تبدأ بالرقم 5 بعد مفتاح الدولة",
    };
  }

  // Case 2: Starts with local 05
  if (cleaned.startsWith("05")) {
    const nationalPart = cleaned.slice(1);
    if (/^5\d{8}$/.test(nationalPart)) {
      return { isValid: true, normalized: `+966${nationalPart}` };
    }
    return {
      isValid: false,
      normalized: "",
      error: "رقم الجوال المحلي يجب أن يتكون من 10 أرقام (05xxxxxxxx)",
    };
  }

  // Case 3: National number without prefix (e.g. 565642556)
  if (/^5\d{8}$/.test(cleaned)) {
    return { isValid: true, normalized: `+966${cleaned}` };
  }

  return {
    isValid: false,
    normalized: "",
    error: "صيغة رقم الجوال غير صحيحة. يرجى إدخال رقم جوال سعودي يبدأ بـ 5 (مثال: 565642556)",
  };
}

/**
 * Checks whether the given string is likely an email address
 */
export function isEmail(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());
}

/**
 * Checks whether the given string looks like a phone number
 */
export function isPhoneNumber(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  const cleaned = input.trim().replace(/[\s\-\(\)\.]/g, "");
  // Contains only digits and optional leading +
  return /^(\+)?\d{7,15}$/.test(cleaned);
}

/**
 * Trims whitespace and uppercases a code so that input typed or pasted by a
 * person can pass validation. The validator itself stays strict.
 */
export const normalizeHetu = (value: string): string => value.trim().toUpperCase();

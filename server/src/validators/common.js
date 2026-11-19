import { z } from 'zod';

// Accepts either a newline-separated string (admin textarea) or an array,
// and always produces a clean TEXT[] value (or null when empty).
export const goalsField = z
  .preprocess((value) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    const parts = Array.isArray(value) ? value : String(value).split(/\r?\n/);
    const goals = parts.map((part) => String(part).trim()).filter(Boolean);
    return goals.length > 0 ? goals : null;
  }, z.array(z.string().trim().min(1).max(500)).max(100).nullable())
  .optional();

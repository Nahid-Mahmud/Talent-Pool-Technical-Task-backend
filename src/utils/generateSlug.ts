import slugify from 'slugify';

/**
 * Converts a course title into a URL-friendly slug.
 * Appends a short random suffix to guarantee uniqueness.
 */
export const generateSlug = (title: string): string => {
  const base = slugify(title, {
    lower: true,
    trim: true,
    strict: true,
  });

  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
};

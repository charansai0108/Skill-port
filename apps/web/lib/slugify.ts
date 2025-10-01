/**
 * Generate URL-friendly slug from string
 * Converts "My Learning Hub" -> "my-learning-hub"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Generate unique slug by appending random string if needed
 */
export function generateUniqueSlug(name: string): string {
  const baseSlug = generateSlug(name)
  const randomSuffix = Math.random().toString(36).substring(2, 6)
  return `${baseSlug}-${randomSuffix}`
}


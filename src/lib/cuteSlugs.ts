import { initialSlugs } from './slug-list';

// Initialize the list of available slugs with the predefined list.
let availableSlugs: string[] = [...initialSlugs];

export const getCuteSlug = (): string => {
  // If we've run out of slugs, use a fallback.
  if (availableSlugs.length === 0) {
    console.warn("Predefined slug list is empty. Using fallback.");
    return `fallback${Date.now()}`;
  }

  // Get a random slug from the list.
  const randomIndex = Math.floor(Math.random() * availableSlugs.length);
  const slug = availableSlugs.splice(randomIndex, 1)[0];

  return slug;
};

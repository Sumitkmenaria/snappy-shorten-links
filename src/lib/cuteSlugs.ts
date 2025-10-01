import { generateNewSlugs } from './gemini';

let availableSlugs: string[] = [
  'adorableAnt',
  'beamingBear',
  'cuddlyCat',
  'dapperDog',
  'elegantElephant',
  'fluffyFox',
  'gigglingGiraffe',
  'happyHippo',
  'innocentIguana',
  'jollyJaguar',
  'kindKoala',
  'laughingLion',
  'merryMonkey',
  'nobleNewt',
  'optimisticOtter',
  'playfulPanda',
  'quirkyQuokka',
  'radiantRabbit',
  'smilingSloth',
  'tinyTiger',
  'uniqueUnicorn',
  'vibrantVole',
  'wittyWalrus',
  'youthfulYak',
  'zestyZebra',
];

const replenishSlugs = async () => {
  console.log("Replenishing slugs...");
  const newSlugs = await generateNewSlugs();
  // Add new slugs and filter out any duplicates
  availableSlugs = [...new Set([...availableSlugs, ...newSlugs])]; 
  console.log("Slugs replenished. Total available:", availableSlugs.length);
};

// Pre-warm the slug cache
replenishSlugs();

export const getCuteSlug = async (): Promise<string> => {
  if (availableSlugs.length === 0) {
    await replenishSlugs();
  }
  
  if (availableSlugs.length === 0) {
    // This should not happen if replenishSlugs works correctly
    console.error("Failed to get a new slug. Using fallback.");
    return `fallback${Date.now()}`;
  }

  const randomIndex = Math.floor(Math.random() * availableSlugs.length);
  const slug = availableSlugs.splice(randomIndex, 1)[0];
  
  // When we are running low on slugs, fetch more in the background
  if (availableSlugs.length < 5) {
    replenishSlugs(); 
  }

  return slug;
};

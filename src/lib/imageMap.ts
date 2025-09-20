// Map local images from ImageFood/ to known dish names
// Vite will transform these imports to URLs at build time
import barneyburger from '../../ImageFood/barneyburger.png';
import tenderloin from '../../ImageFood/tenderloin.png';
import irishpizza from '../../ImageFood/irishpizza.png';
import boatofwings from '../../ImageFood/boatofwings.png';
import madmushroom from '../../ImageFood/madmushroom.png';
import breakfastburrito from '../../ImageFood/breakfastburrito.png';
import swissrosti from '../../ImageFood/swissrosti.png';
import chocolateshopburger from '../../ImageFood/chocolateshopburger.png';
import linguinecarbonara from '../../ImageFood/linguinecarbonara.png';
import bulgogi from '../../ImageFood/bulgogi.png';

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

const entries: Array<{ match: RegExp; url: string }> = [
  { match: /(barney.*burger|triplexxx.*burger|barneyburger)/i, url: barneyburger },
  { match: /(tenderloin|breaded.*tenderloin)/i, url: tenderloin },
  { match: /(irish.*pizza)/i, url: irishpizza },
  { match: /(boat.*wing|wings)/i, url: boatofwings },
  { match: /(mad.*mushroom.*pizza|mushroom.*pizza)/i, url: madmushroom },
  { match: /(breakfast.*burrito|burrito)/i, url: breakfastburrito },
  { match: /(swiss.*rosti|rosti)/i, url: swissrosti },
  { match: /(chocolate.*shop.*burger)/i, url: chocolateshopburger },
  { match: /(linguine.*carbonara|carbonara|linguine)/i, url: linguinecarbonara },
  { match: /(bulgogi|korean.*bbq)/i, url: bulgogi },
];

export function getLocalImageForFood(name?: string): string | undefined {
  if (!name) return undefined;
  for (const e of entries) {
    if (e.match.test(name)) return e.url;
  }
  // Last resort: try exact filename-style match
  const key = normalize(name);
  if (key.includes('barney') && key.includes('burger')) return barneyburger;
  if (key.includes('tenderloin')) return tenderloin;
  if (key.includes('irish') && key.includes('pizza')) return irishpizza;
  if (key.includes('wing')) return boatofwings;
  if (key.includes('mushroom') && key.includes('pizza')) return madmushroom;
  if (key.includes('burrito')) return breakfastburrito;
  if (key.includes('rosti')) return swissrosti;
  if (key.includes('chocolate') && key.includes('burger')) return chocolateshopburger;
  if (key.includes('carbonara') || key.includes('linguine')) return linguinecarbonara;
  if (key.includes('bulgogi') || key.includes('korean')) return bulgogi;
  return undefined;
}

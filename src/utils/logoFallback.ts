// External logo sources for when OpenLigaDB logos are missing or low quality
// This provides fallback URLs from Wikipedia/Wikimedia Commons
// Direct Wikimedia Commons logo URLs for specific teams (high quality SVGs)
const WIKIMEDIA_DIRECT_LOGOS: Record<string, string> = {
  // German Clubs
  'Borussia Dortmund': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/200px-Borussia_Dortmund_logo.svg.png',
  'FC Bayern München': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/200px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png',
  'Bayer 04 Leverkusen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Bayer_Leverkusen_Logo.svg/200px-Bayer_Leverkusen_Logo.svg.png',
  'Eintracht Frankfurt': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Eintracht_Frankfurt_Logo.svg/200px-Eintracht_Frankfurt_Logo.svg.png',
  'VfB Stuttgart': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/VfB_Stuttgart_1893_Logo.svg/200px-VfB_Stuttgart_1893_Logo.svg.png',
  'RB Leipzig': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/RB_Leipzig_2014_logo.svg/200px-RB_Leipzig_2014_logo.svg.png',

  // English Clubs
  'Liverpool FC': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Liverpool_FC.svg/200px-Liverpool_FC.svg.png',
  'Chelsea FC': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Chelsea_FC.svg/200px-Chelsea_FC.svg.png',
  'Arsenal FC': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Arsenal_FC.svg/200px-Arsenal_FC.svg.png',
  'Manchester City': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Manchester_City_FC_badge.svg/200px-Manchester_City_FC_badge.svg.png',
  'Manchester United': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Manchester_United_FC_crest.svg/200px-Manchester_United_FC_crest.svg.png',
  'Tottenham Hotspur': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Tottenham_Hotspur.svg/200px-Tottenham_Hotspur.svg.png',
  'Aston Villa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Aston_Villa_FC_crest_%282016%29.svg/200px-Aston_Villa_FC_crest_%282016%29.svg.png',

  // Spanish Clubs
  'Real Madrid': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Logo_Real_Madrid.svg/200px-Logo_Real_Madrid.svg.png',
  'FC Barcelona': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/FC_Barcelona_%28crest%29.svg/200px-FC_Barcelona_%28crest%29.svg.png',
  'Atlético Madrid': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Atletico_Madrid_2017_logo.svg/200px-Atletico_Madrid_2017_logo.svg.png',
  'Villarreal CF': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Villarreal_CF_logo-en.svg/200px-Villarreal_CF_logo-en.svg.png',

  // Italian Clubs
  'Inter Mailand': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/200px-FC_Internazionale_Milano_2021.svg.png',
  'Inter Milan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/200px-FC_Internazionale_Milano_2021.svg.png',
  'Juventus Turin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Juventus_logo.svg/200px-Juventus_logo.svg.png',
  'Juventus': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Juventus_logo.svg/200px-Juventus_logo.svg.png',
  'AC Mailand': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/200px-Logo_of_AC_Milan.svg.png',
  'AC Milan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/200px-Logo_of_AC_Milan.svg.png',

  // French Clubs
  'Paris Saint-Germain': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Paris_Saint-Germain_Logo.svg/200px-Paris_Saint-Germain_Logo.svg.png',
  'PSG': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Paris_Saint-Germain_Logo.svg/200px-Paris_Saint-Germain_Logo.svg.png',

  // Dutch Clubs
  'PSV Eindhoven': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/PSV_Eindhoven.svg/200px-PSV_Eindhoven.svg.png',

  // Portuguese Clubs
  'Benfica Lissabon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/SL_Benfica_logo.svg/200px-SL_Benfica_logo.svg.png',

  // Other
  'FC Kopenhagen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/FC_K%C3%B8benhavn_logo.svg/200px-FC_K%C3%B8benhavn_logo.svg.png',
  'Qarabag Agdam': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Qaraba%C4%9F_FK_logo.svg/200px-Qaraba%C4%9F_FK_logo.svg.png',
  'Galatasaray Istanbul': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Galatasaray_Sports_Club_Logo.png/200px-Galatasaray_Sports_Club_Logo.png',
  'St. Gilloise': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Royale_Union_Saint-Gilloise_logo.svg/200px-Royale_Union_Saint-Gilloise_logo.svg.png',
};

/**
 * Get a fallback logo URL for a team name
 * Uses Wikimedia Commons as fallback source
 */
export function getLogoFallback(teamName: string): string | null {
  // First try direct logo mapping
  if (WIKIMEDIA_DIRECT_LOGOS[teamName]) {
    return WIKIMEDIA_DIRECT_LOGOS[teamName];
  }

  // Try partial matches (for slight name variations)
  for (const [key, url] of Object.entries(WIKIMEDIA_DIRECT_LOGOS)) {
    if (teamName.includes(key) || key.includes(teamName)) {
      return url;
    }
  }

  return null;
}

/**
 * Get the best quality logo URL, with fallbacks
 * 1. Try OpenLigaDB logo
 * 2. Fall back to Wikimedia Commons
 * 3. Return placeholder if all fail
 */
export function getBestLogoUrl(openLigaDbUrl: string, teamName: string): string {
  // If OpenLigaDB URL looks good, use it
  if (openLigaDbUrl && openLigaDbUrl.includes('http')) {
    return openLigaDbUrl;
  }

  // Try fallback
  const fallback = getLogoFallback(teamName);
  if (fallback) {
    return fallback;
  }

  // Return original (even if it's bad)
  return openLigaDbUrl || '/images/tbd-logo.svg';
}

export interface PlayerItem {
  id: string;
  name: string;
  role: string;
}

export interface TeamSquad {
  batters: PlayerItem[];
  allRounders: PlayerItem[];
  wicketKeepers: PlayerItem[];
  bowlers: PlayerItem[];
}

export interface TeamItem {
  team: string;
  squad: TeamSquad;
}

export interface SquadsApiResponse {
  teams: TeamItem[];
}

let cachedSquadsApiData: SquadsApiResponse | null = null;

export async function fetchSquadsFromApi(): Promise<SquadsApiResponse> {
  if (cachedSquadsApiData) return cachedSquadsApiData;

  try {
    // Try primary API route /api/squads
    let response = await fetch('/api/squads');
    if (!response.ok) {
      // Fallback to static public url /squads.json
      response = await fetch('/squads.json');
    }
    
    if (!response.ok) {
      throw new Error(`Squads API returned HTTP status ${response.status}`);
    }

    const data: SquadsApiResponse = await response.json();
    cachedSquadsApiData = data;
    return data;
  } catch (err) {
    console.warn('Failed to fetch from /api/squads, using in-memory dataset:', err);
    throw err;
  }
}

export function getCachedSquadsData(): SquadsApiResponse | null {
  return cachedSquadsApiData;
}

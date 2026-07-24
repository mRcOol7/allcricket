import { Country } from '../types/cricket';
import { FALLBACK_COUNTRIES_DATA } from './fallbackCountriesData';

const REST_COUNTRIES_V5_DIRECT = 'https://api.restcountries.com/countries/v5';
const REST_COUNTRIES_V5_PROXY = '/api-restcountries/countries/v5';

// Read API token strictly from environment variable (.env)
const RAW_ENV_TOKEN = (import.meta as any).env?.VITE_REST_COUNTRIES_BEARER_TOKEN || '';
const BEARER_TOKEN = RAW_ENV_TOKEN
  ? (RAW_ENV_TOKEN.startsWith('Bearer ') ? RAW_ENV_TOKEN : `Bearer ${RAW_ENV_TOKEN}`)
  : '';

const CACHE_KEY = 'cricket_wc_sim_v5_countries_cache_v2';

export interface FetchCountriesResult {
  allCountries: Country[];
  sovereignCountries: Country[];
}

export async function fetchRestCountriesV5(): Promise<FetchCountriesResult> {
  // 1. Try Local Storage Cache
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed.allCountries) && parsed.allCountries.length > 100) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('LocalStorage error reading country cache:', e);
  }

  // 2. Fetch via Proxy / Direct REST Countries v5 API if Bearer token exists
  const rawObjects: any[] = [];
  let fetchSuccessful = false;

  if (BEARER_TOKEN) {
    const endpointCandidates = [REST_COUNTRIES_V5_PROXY, REST_COUNTRIES_V5_DIRECT];

    for (const baseUrl of endpointCandidates) {
      try {
        rawObjects.length = 0;
        let hasMore = true;

        for (let offset = 0; offset < 350 && hasMore; offset += 25) {
          const response = await fetch(`${baseUrl}?offset=${offset}`, {
            headers: {
              'Authorization': BEARER_TOKEN
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error ${response.status} from ${baseUrl}`);
          }

          const data = await response.json();

          if (data.errors && data.errors.length > 0) {
            throw new Error(`API error: ${data.errors[0].message}`);
          }

          const items = data.data?.objects || (Array.isArray(data.data) ? data.data : []);
          if (!items || items.length === 0) {
            hasMore = false;
            break;
          }

          rawObjects.push(...items);
          if (data.data?.more === false) {
            hasMore = false;
          }
        }

        if (rawObjects.length > 50) {
          fetchSuccessful = true;
          break;
        }
      } catch (err) {
        console.warn(`Fetch candidate ${baseUrl} failed:`, err);
      }
    }
  }

  // 3. Process API objects
  let allCountries: Country[] = [];

  if (fetchSuccessful && rawObjects.length > 0) {
    allCountries = rawObjects.map((item: any, idx: number) => {
      const alpha2 = item.codes?.alpha_2 || '';
      const alpha3 = item.codes?.alpha_3 || '';
      const fifa = item.codes?.fifa || '';
      const id = alpha3 || item.uuid || `country_${idx}`;
      const commonName = item.names?.common || item.names?.official || 'Unknown Country';
      const officialName = item.names?.official || commonName;

      let flagUrl = item.flag?.url_png || item.flag?.url_svg || '';
      if (!flagUrl && alpha2) {
        flagUrl = `https://flagcdn.com/w160/${alpha2.toLowerCase()}.png`;
      }

      const emoji = item.flag?.emoji || '🏏';
      const region = item.region || item.continents?.[0] || 'Unknown';
      const subregion = item.subregion || '';
      const population = item.population || 0;
      const isSovereign = item.classification?.sovereign === true;
      const isUnMember = item.classification?.un_member === true;
      const isoCode = alpha3 || alpha2 || 'N/A';
      const fifaCode = fifa || alpha3 || alpha2 || 'N/A';

      return {
        id,
        alpha2,
        name: commonName,
        officialName,
        flagUrl,
        emoji,
        isoCode,
        fifaCode,
        region,
        subregion,
        population,
        isSovereign,
        isUnMember
      };
    });
  } else {
    // Fallback if API key is missing or request fails
    allCountries = (FALLBACK_COUNTRIES_DATA as any[]).map((c: any, idx: number) => ({
      id: c.id || `fb_${idx}`,
      alpha2: c.alpha2 || '',
      name: c.name,
      officialName: c.officialName || c.name,
      flagUrl: c.flagUrl || `https://flagcdn.com/w160/${(c.alpha2 || 'xx').toLowerCase()}.png`,
      emoji: '🏏',
      isoCode: c.isoCode || 'N/A',
      fifaCode: c.fifaCode || 'N/A',
      region: c.region || 'Asia',
      population: c.population || 1000000,
      isSovereign: c.isSovereign ?? true,
      isUnMember: true
    }));
  }

  const sovereignCountries = allCountries.filter((c) => c.isSovereign);

  const result: FetchCountriesResult = {
    allCountries,
    sovereignCountries
  };

  if (allCountries.length > 0) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(result));
    } catch (e) {
      console.warn('Failed saving cache:', e);
    }
  }

  return result;
}

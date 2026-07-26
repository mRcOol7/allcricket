import { fetchSquadsFromApi, TeamItem } from '../services/squadsApi';
import squadsData from '../data/squads.json';

// Helper to map country names or ISO codes to 3-letter bank keys
export function getTeamCountryCode(teamNameOrId: string): string {
  const name = (teamNameOrId || '').toLowerCase().trim();
  if (name === 'zaf' || name === 'rsa' || name.includes('south africa') || name.includes('south-africa')) return 'RSA';
  if (name === 'ind' || name.includes('india')) return 'IND';
  if (name === 'nam' || name.includes('namibia')) return 'NAM';
  if (name === 'aus' || name.includes('australia')) return 'AUS';
  if (name === 'zim' || name.includes('zimbabwe')) return 'ZIM';
  if (name === 'oma' || name.includes('oman')) return 'OMA';
  if (name === 'eng' || name.includes('england')) return 'ENG';
  if (name === 'npl' || name === 'nep' || name.includes('nepal')) return 'NEP';
  if (name === 'nzl' || name.includes('new zealand') || name.includes('new-zealand')) return 'NZL';
  if (name === 'afg' || name.includes('afghanistan')) return 'AFG';
  if (name === 'irl' || name.includes('ireland')) return 'IRE';
  if (name === 'nld' || name === 'ned' || name.includes('netherlands')) return 'NED';
  if (name === 'ita' || name.includes('italy')) return 'ITA';
  if (name === 'can' || name.includes('canada')) return 'CAN';
  if (name === 'pak' || name.includes('pakistan')) return 'PAK';
  if (name === 'win' || name.includes('west indies') || name.includes('west-indies')) return 'WIN';
  if (name === 'sco' || name.includes('scotland')) return 'SCO';
  if (name === 'usa' || name.includes('united states') || name.includes('america')) return 'USA';
  if (name === 'are' || name === 'uae' || name.includes('emirates')) return 'UAE';
  if (name === 'lka' || name === 'sri' || name.includes('sri lanka') || name.includes('sri-lanka')) return 'SRI';
  return (teamNameOrId || '').toUpperCase();
}

// Localized Cricket Player Names for Cricket World Cup Simulation
const CRICKET_COUNTRY_BANKS: Record<string, { batters: string[]; bowlers: string[] }> = {
  IND: {
    batters: ['Suryakumar Yadav (Captain)', 'Tilak Varma', 'Rinku Singh', 'Abhishek Sharma', 'Hardik Pandya', 'Shivam Dube', 'Sanju Samson', 'Ishan Kishan'],
    bowlers: ['Jasprit Bumrah', 'Varun Chakaravarthy', 'Kuldeep Yadav', 'Arshdeep Singh', 'Mohammed Siraj', 'Axar Patel', 'Washington Sundar']
  },
  NAM: {
    batters: ['Gerhard Erasmus (Captain)', 'Malan Kruger', 'Jan Frylinck', 'Louren Steenkamp', 'Jan Balt', 'Dylan Leicher', 'Alexander Volschenk', 'Zane Green', 'Jan Nicol Loftie-Eaton'],
    bowlers: ['Bernard Scholtz', 'Ruben Trumpelmann', 'Jack Brassell', 'Ben Shikongo', 'Willem Myburgh', 'Max Heingo', 'JJ Smit']
  },
  AUS: {
    batters: ['Mitchell Marsh (Captain)', 'Tim David', 'Travis Head', 'Matt Renshaw', 'Steven Smith', 'Cooper Connolly', 'Cameron Green', 'Glenn Maxwell', 'Marcus Stoinis', 'Josh Inglis'],
    bowlers: ['Xavier Bartlett', 'Nathan Ellis', 'Matthew Kuhnemann', 'Adam Zampa', 'Ben Dwarshuis']
  },
  ZIM: {
    batters: ['Sikandar Raza (Captain)', 'Tashinga Musekiwa', 'Dion Myers', 'Ben Curran', 'Brian Bennett', 'Ryan Burl', 'Tinotenda Maposa', 'Clive Madande', 'Tadiwanashe Marumani'],
    bowlers: ['Graeme Cremer', 'Wellington Masakadza', 'Blessing Muzarabani', 'Richard Ngarava', 'Brad Evans', 'Tony Munyonga']
  },
  OMA: {
    batters: ['Jatinder Singh (Captain)', 'Ashish Odedara', 'Karan Sonavale', 'Wasim Ali', 'Aamir Kaleem', 'Hammad Mirza', 'Vinayak Shukla'],
    bowlers: ['Nadeem Khan', 'Shah Faisal', 'Shakeel Ahmed', 'Sufyan Mehmood', 'Jay Odedra', 'Mohammad Nadeem', 'Jiten Ramanandi', 'Shafiq Jan']
  },
  ENG: {
    batters: ['Harry Brook (Captain)', 'Ben Duckett', 'Jacob Bethell', 'Will Jacks', 'Tom Banton', 'Jos Buttler', 'Philip Salt'],
    bowlers: ['Jofra Archer', 'Adil Rashid', 'Josh Tongue', 'Luke Wood', 'Rehan Ahmed', 'Sam Curran', 'Liam Dawson', 'Jamie Overton']
  },
  NEP: {
    batters: ['Rohit Paudel (Captain)', 'Kushal Bhurtel', 'Sundeep Jora', 'Dipendra Singh Airee', 'Aasif Sheikh', 'Lokesh Bam'],
    bowlers: ['Sandeep Lamichhane', 'Basir Ahamad', 'Lalit Rajbanshi', 'Sher Malla', 'Aarif Sheikh', 'Sompal Kami', 'Karan KC', 'Nandan Yadav', 'Gulsan Jha']
  },
  RSA: {
    batters: ['Aiden Markram (Captain)', 'Dewald Brevis', 'David Miller', 'Jason Smith', 'Quinton de Kock', 'Tristan Stubbs', 'Ryan Rickelton'],
    bowlers: ['Keshav Maharaj', 'Kagiso Rabada', 'Kwena Maphaka', 'Lungi Ngidi', 'Anrich Nortje', 'George Linde', 'Marco Jansen', 'Corbin Bosch']
  },
  NZL: {
    batters: ['Mitchell Santner (Captain)', 'Finn Allen', 'Mark Chapman', 'Daryl Mitchell', 'James Neesham', 'Rachin Ravindra', 'Devon Conway', 'Glenn Phillips', 'Tim Seifert'],
    bowlers: ['Jacob Duffy', 'Lockie Ferguson', 'Matt Henry', 'Ish Sodhi', 'Kyle Jamieson', 'Cole McConchie']
  },
  SRI: {
    batters: ['Dasun Shanaka (Captain)', 'Pathum Nissanka', 'Pavan Rathnayake', 'Kamindu Mendis', 'Charith Asalanka', 'Janith Liyanage', 'Kamil Mishara', 'Kusal Mendis', 'Kusal Perera'],
    bowlers: ['Maheesh Theekshana', 'Dushmantha Chameera', 'Matheesha Pathirana', 'Pramod Madushan', 'Dilshan Madushanka', 'Wanindu Hasaranga', 'Dunith Wellalage', 'Dushan Hemantha']
  },
  CAN: {
    batters: ['Dilpreet Bajwa (Captain)', 'Ravinderpal Singh', 'Yuvraj Samra', 'Navneet Dhaliwal', 'Nicholas Kirton', 'Harsh Thaker', 'Shreyas Movva', 'Kanwarpal Tathgur'],
    bowlers: ['Shivam Sharma', 'Dilon Heyliger', 'Kaleem Sana', 'Jaskaran Singh', 'Ajayveer Hundal', 'Saad Bin Zafar', 'Ansh Patel']
  },
  PAK: {
    batters: ['Salman Agha (Captain)', 'Babar Azam', 'Fakhar Zaman', 'Sahibzada Farhan', 'Saim Ayub', 'Khawaja Nafay', 'Usman Khan'],
    bowlers: ['Abrar Ahmed', 'Naseem Shah', 'Shaheen Afridi', 'Usman Tariq', 'Salman Mirza', 'Faheem Ashraf', 'Mohammad Nawaz', 'Shadab Khan']
  },
  WIN: {
    batters: ['Shai Hope (Captain)', 'Shimron Hetmyer', 'Brandon King', 'Rovman Powell', 'Sherfane Rutherford', 'Quentin Sampson', 'Johnson Charles'],
    bowlers: ['Matthew Forde', 'Akeal Hosein', 'Shamar Joseph', 'Gudakesh Motie', 'Jayden Seales', 'Jason Holder', 'Roston Chase', 'Romario Shepherd']
  },
  SCO: {
    batters: ['Richie Berrington (Captain)', 'Michael Jones', 'George Munsey', 'Tom Bruce', 'Michael Leask', 'Brandon McMullen', 'Matthew Cross'],
    bowlers: ['Brad Currie', 'Oliver Davidson', 'Chris Greaves', 'Safyaan Sharif', 'Brad Wheal', 'Zainullah Ihsan', 'Finlay McCreath', 'Mark Watt', 'Jack Jarvis']
  },
  USA: {
    batters: ['Monank Patel (Captain)', 'Shayan Jahangir', 'Saiteja Mukkamalla', 'Shehan Jayasuriya', 'Milind Kumar', 'Shubham Ranjane', 'Andries Gous'],
    bowlers: ['Nosthush Kenjige', 'Saurabh Netravalkar', 'Ali Khan', 'Ehsan Adil', 'Sanjay Krishnamurthi', 'Harmeet Singh', 'Shadley van Schalkwyk', 'Mohammad Mohsin']
  },
  UAE: {
    batters: ['Muhammad Waseem (Captain)', 'Sohaib Khan', 'Mayank Kumar', 'Dhruv Parashar', 'Alishan Sharafu', 'Aryansh Sharma', 'Syed Haider'],
    bowlers: ['Simranjeet Singh', 'Muhammad Rohid Khan', 'Muhammad Jawadullah', 'Muhammad Farooq', 'Muhammad Arfan', 'Junaid Siddique', 'Haider Ali', 'Harshit Kaushik']
  },
};

const CRICKET_REGIONAL_BANKS: Record<string, { batters: string[]; bowlers: string[] }> = {
  Asia: {
    batters: ['R. Khan', 'S. Ali', 'M. Ahmed', 'K. Sharma', 'A. Rahman', 'P. Sen', 'T. Than', 'H. Lin'],
    bowlers: ['M. Khan', 'S. Kumar', 'A. Hussain', 'Z. Malik', 'T. Singh', 'N. Islam']
  },
  Africa: {
    batters: ['J. Erasmus', 'G. Williams', 'M. van Lingen', 'K. Birnie', 'R. Trumpelmann', 'B. Mukasa'],
    bowlers: ['R. Ngarava', 'B. Muzarabani', 'S. Williams', 'J. Lord', 'P. Ndlovu']
  },
  Europe: {
    batters: ['M. O\'Dowd', 'V. Singh', 'B. de Leede', 'S. Engelbrecht', 'G. Munsey', 'R. Berrington'],
    bowlers: ['L. van Beek', 'P. van Meekeren', 'A. Dutt', 'B. Wheal', 'M. Watt']
  },
  Americas: {
    batters: ['A. Gous', 'S. Taylor', 'M. Patel', 'N. Kumar', 'A. Jones', 'N. Kirton'],
    bowlers: ['S. Netravalkar', 'A. Khan', 'H. Singh', 'D. Dillon', 'N. Kenjige']
  },
  Oceania: {
    batters: ['C. Amini', 'T. Ura', 'L. Siaka', 'H. Hiri', 'K. Doriga', 'N. Vanua'],
    bowlers: ['N. Pokana', 'C. Soper', 'K. Morea', 'J. Kariko', 'S. Kamea']
  }
};

export function getRandomCricketBatter(countryId: string, region: string): string {
  const code = getTeamCountryCode(countryId);
  if (CRICKET_COUNTRY_BANKS[code]) {
    const list = CRICKET_COUNTRY_BANKS[code].batters;
    return list[Math.floor(Math.random() * list.length)];
  }

  let regKey = 'Asia';
  const r = (region || '').toLowerCase();
  if (r.includes('africa')) regKey = 'Africa';
  else if (r.includes('asia')) regKey = 'Asia';
  else if (r.includes('america')) regKey = 'Americas';
  else if (r.includes('europe')) regKey = 'Europe';
  else if (r.includes('oceania')) regKey = 'Oceania';

  const regList = (CRICKET_REGIONAL_BANKS[regKey] || CRICKET_REGIONAL_BANKS.Asia).batters;
  return regList[Math.floor(Math.random() * regList.length)];
}

export function getRandomCricketBowler(countryId: string, region: string): string {
  const code = getTeamCountryCode(countryId);
  if (CRICKET_COUNTRY_BANKS[code]) {
    const list = CRICKET_COUNTRY_BANKS[code].bowlers;
    return list[Math.floor(Math.random() * list.length)];
  }

  let regKey = 'Asia';
  const r = (region || '').toLowerCase();
  if (r.includes('africa')) regKey = 'Africa';
  else if (r.includes('asia')) regKey = 'Asia';
  else if (r.includes('america')) regKey = 'Americas';
  else if (r.includes('europe')) regKey = 'Europe';
  else if (r.includes('oceania')) regKey = 'Oceania';

  const regList = (CRICKET_REGIONAL_BANKS[regKey] || CRICKET_REGIONAL_BANKS.Asia).bowlers;
  return regList[Math.floor(Math.random() * regList.length)];
}

export interface CricketPlayerProfile {
  name: string;
  role: 'Batter' | 'Wicket Keeper' | 'All-Rounder' | 'Bowler';
  rating: number; // e.g. 85 - 98
}

export function getFullPlayingXI(countryId: string, region: string): CricketPlayerProfile[] {
  const code = getTeamCountryCode(countryId);
  let batters: string[] = [];
  let bowlers: string[] = [];

  if (CRICKET_COUNTRY_BANKS[code]) {
    batters = CRICKET_COUNTRY_BANKS[code].batters;
    bowlers = CRICKET_COUNTRY_BANKS[code].bowlers;
  } else {
    let regKey = 'Asia';
    const r = (region || '').toLowerCase();
    if (r.includes('africa')) regKey = 'Africa';
    else if (r.includes('asia')) regKey = 'Asia';
    else if (r.includes('america')) regKey = 'Americas';
    else if (r.includes('europe')) regKey = 'Europe';
    else if (r.includes('oceania')) regKey = 'Oceania';

    batters = CRICKET_REGIONAL_BANKS[regKey]?.batters || CRICKET_REGIONAL_BANKS.Asia.batters;
    bowlers = CRICKET_REGIONAL_BANKS[regKey]?.bowlers || CRICKET_REGIONAL_BANKS.Asia.bowlers;
  }

  const squad: CricketPlayerProfile[] = [];
  
  // Top 5 Batters
  for (let i = 0; i < 5; i++) {
    const name = batters[i % batters.length] || `Batter ${i + 1}`;
    squad.push({
      name,
      role: i === 1 ? 'Wicket Keeper' : 'Batter',
      rating: 84 + Math.floor(Math.random() * 14)
    });
  }

  // 2 All-Rounders
  squad.push({
    name: batters[5 % batters.length] || 'All Rounder 1',
    role: 'All-Rounder',
    rating: 83 + Math.floor(Math.random() * 12)
  });
  squad.push({
    name: bowlers[0 % bowlers.length] || 'All Rounder 2',
    role: 'All-Rounder',
    rating: 82 + Math.floor(Math.random() * 12)
  });

  // 4 Bowlers
  for (let i = 1; i <= 4; i++) {
    const name = bowlers[i % bowlers.length] || `Bowler ${i}`;
    squad.push({
      name,
      role: 'Bowler',
      rating: 83 + Math.floor(Math.random() * 14)
    });
  }

  return squad;
}

// Dynamic API Preloader function for fetching /api/squads
export async function initSquadsFromApi(): Promise<void> {
  try {
    const data = await fetchSquadsFromApi();
    if (data && data.teams && Array.isArray(data.teams)) {
      data.teams.forEach((t: TeamItem) => {
        const teamKey = getTeamCountryCode(t.team);
        if (teamKey && t.squad) {
          const battersList = [
            ...(t.squad.batters || []).map(p => p.name),
            ...(t.squad.allRounders || []).filter(p => p.role.includes('Batting')).map(p => p.name),
            ...(t.squad.wicketKeepers || []).map(p => p.name)
          ];
          const bowlersList = [
            ...(t.squad.bowlers || []).map(p => p.name),
            ...(t.squad.allRounders || []).filter(p => p.role.includes('Bowling')).map(p => p.name)
          ];
          if (battersList.length > 0 || bowlersList.length > 0) {
            CRICKET_COUNTRY_BANKS[teamKey] = {
              batters: battersList.length > 0 ? battersList : (CRICKET_COUNTRY_BANKS[teamKey]?.batters || []),
              bowlers: bowlersList.length > 0 ? bowlersList : (CRICKET_COUNTRY_BANKS[teamKey]?.bowlers || [])
            };
          }
        }
      });
    }
  } catch (err) {
    console.warn('Using in-memory squad fallback:', err);
  }
}

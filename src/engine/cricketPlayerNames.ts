// Localized Cricket Player Names for Cricket World Cup Simulation

const CRICKET_COUNTRY_BANKS: Record<string, { batters: string[]; bowlers: string[] }> = {
  IND: {
    batters: ['V. Kohli', 'R. Sharma', 'S. Gill', 'S. Yadav', 'KL Rahul', 'R. Pant', 'R. Gaikwad', 'Y. Jaiswal'],
    bowlers: ['J. Bumrah', 'M. Siraj', 'M. Shami', 'K. Yadav', 'R. Jadeja', 'A. Patel', 'A. Singh']
  },
  AUS: {
    batters: ['T. Head', 'M. Marsh', 'S. Smith', 'G. Maxwell', 'D. Warner', 'M. Labuschagne', 'J. Inglis'],
    bowlers: ['P. Cummins', 'M. Starc', 'J. Hazlewood', 'A. Zampa', 'N. Lyon', 'X. Bartlett']
  },
  ENG: {
    batters: ['J. Buttler', 'J. Root', 'H. Brook', 'B. Stokes', 'P. Salt', 'L. Livingstone', 'D. Malan'],
    bowlers: ['J. Archer', 'A. Rashid', 'M. Wood', 'S. Curran', 'R. Topley', 'G. Atkinson']
  },
  PAK: {
    batters: ['B. Azam', 'M. Rizwan', 'F. Zaman', 'S. Ayub', 'I. Ahmed', 'A. Shafique'],
    bowlers: ['S. Afridi', 'N. Shah', 'H. Rauf', 'S. Khan', 'A. Ahmed', 'M. Wasim']
  },
  RSA: {
    batters: ['H. Klaasen', 'Q. de Kock', 'A. Markram', 'D. Miller', 'T. de Zorzi', 'R. van der Dussen'],
    bowlers: ['K. Rabada', 'A. Nortje', 'M. Jansen', 'K. Maharaj', 'L. Williams', 'T. Shamsi']
  },
  NZL: {
    batters: ['K. Williamson', 'D. Conway', 'R. Ravindra', 'G. Phillips', 'D. Mitchell', 'M. Chapman'],
    bowlers: ['T. Boult', 'T. Southee', 'M. Santner', 'L. Ferguson', 'M. Henry', 'I. Sodhi']
  },
  SRI: {
    batters: ['P. Nissanka', 'K. Mendis', 'C. Asalanka', 'D. de Silva', 'S. Samarawickrama', 'K. Perera'],
    bowlers: ['M. Pathirana', 'W. Hasaranga', 'M. Theekshana', 'D. Madushanka', 'K. Rajitha']
  },
  BAN: {
    batters: ['S. Hasan', 'L. Das', 'N. Hossain Shanto', 'T. Hridoy', 'M. Rahim', 'M. Mahmudullah'],
    bowlers: ['M. Rahman', 'T. Ahmed', 'S. Islam', 'M. Hasan Miraz', 'T. Sakib']
  },
  AFG: {
    batters: ['R. Gurbaz', 'I. Zadran', 'G. Naib', 'A. Omarzai', 'N. Zadran', 'M. Nabi'],
    bowlers: ['R. Khan', 'F. Farooqi', 'N. Ahmad', 'M. Ur Rahman', 'N. Haq']
  },
  WIN: {
    batters: ['N. Pooran', 'S. Hope', 'R. Powell', 'E. Lewis', 'B. King', 'S. Rutherford'],
    bowlers: ['A. Joseph', 'G. Motie', 'A. Hosein', 'R. Shepherd', 'J. Holder', 'O. McCoy']
  }
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
  const upper = (countryId || '').toUpperCase();
  if (CRICKET_COUNTRY_BANKS[upper]) {
    const list = CRICKET_COUNTRY_BANKS[upper].batters;
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
  const upper = (countryId || '').toUpperCase();
  if (CRICKET_COUNTRY_BANKS[upper]) {
    const list = CRICKET_COUNTRY_BANKS[upper].bowlers;
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

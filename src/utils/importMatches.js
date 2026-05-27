import { collection, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import partidosData from '../data/partidos.json';
import { getCountryName } from './countries';

const TEAM_TO_CODE = {
  'Mexico': 'mx',
  'South Africa': 'za',
  'South Korea': 'kr',
  'Czech Republic': 'cz',
  'Canada': 'ca',
  'Bosnia & Herzegovina': 'ba',
  'Qatar': 'qa',
  'Switzerland': 'ch',
  'Brazil': 'br',
  'Morocco': 'ma',
  'Haiti': 'ht',
  'Scotland': 'gb-sct',
  'USA': 'us',
  'Paraguay': 'py',
  'Australia': 'au',
  'Turkey': 'tr',
  'Germany': 'de',
  'Curaçao': 'cw',
  'Ivory Coast': 'ci',
  'Ecuador': 'ec',
  'Netherlands': 'nl',
  'Japan': 'jp',
  'Sweden': 'se',
  'Tunisia': 'tn',
  'Belgium': 'be',
  'Egypt': 'eg',
  'Iran': 'ir',
  'New Zealand': 'nz',
  'Spain': 'es',
  'Cape Verde': 'cv',
  'Saudi Arabia': 'sa',
  'Uruguay': 'uy',
  'France': 'fr',
  'Senegal': 'sn',
  'Iraq': 'iq',
  'Norway': 'no',
  'Argentina': 'ar',
  'Algeria': 'dz',
  'Austria': 'at',
  'Jordan': 'jo',
  'Portugal': 'pt',
  'DR Congo': 'cd',
  'Uzbekistan': 'uz',
  'Colombia': 'co',
  'England': 'gb-eng',
  'Croatia': 'hr',
  'Ghana': 'gh',
  'Panama': 'pa',
};

const GROUP_TRANSLATION = {
  'Group A': 'Grupo A',
  'Group B': 'Grupo B',
  'Group C': 'Grupo C',
  'Group D': 'Grupo D',
  'Group E': 'Grupo E',
  'Group F': 'Grupo F',
  'Group G': 'Grupo G',
  'Group H': 'Grupo H',
  'Group I': 'Grupo I',
  'Group J': 'Grupo J',
  'Group K': 'Grupo K',
  'Group L': 'Grupo L',
};

function parseMatchDateTime(dateStr, timeStr) {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s+UTC([+-]\d{1,2})$/);
  if (!match) {
    const fallback = new Date(`${dateStr}T${timeStr}`);
    return { dateTime: fallback, dateTimestamp: fallback.getTime() };
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const offset = parseInt(match[3], 10);
  const sign = offset >= 0 ? '+' : '-';
  const iso = `${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00${sign}${String(Math.abs(offset)).padStart(2, '0')}:00`;
  const dateTime = new Date(iso);

  return { dateTime, dateTimestamp: dateTime.getTime() };
}

export async function hasExistingMatches(db) {
  const snap = await getDocs(collection(db, 'matches'));
  return snap.docs.length > 0;
}

export async function importGroupMatches(db, onProgress) {
  const groupMatches = partidosData.matches.filter(m => m.group);
  const total = groupMatches.length;

  const batch = writeBatch(db);
  let count = 0;

  for (const match of groupMatches) {
    const homeTeamCode = TEAM_TO_CODE[match.team1] || '';
    const awayTeamCode = TEAM_TO_CODE[match.team2] || '';
    const { dateTime, dateTimestamp } = parseMatchDateTime(match.date, match.time);
    const group = GROUP_TRANSLATION[match.group] || match.group;

    const docRef = doc(collection(db, 'matches'));
    batch.set(docRef, {
      homeTeam: getCountryName(homeTeamCode) || match.team1,
      awayTeam: getCountryName(awayTeamCode) || match.team2,
      homeTeamCode,
      awayTeamCode,
      date: dateTime.toISOString(),
      dateTimestamp,
      group,
      result: null,
      createdAt: new Date().toISOString(),
    });

    count++;
    if (onProgress) onProgress(count, total);
  }

  await batch.commit();
  return total;
}

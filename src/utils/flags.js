const countryFlags = {
  'México': '🇲🇽', 'Mexico': '🇲🇽', 'MEX': '🇲🇽', 'mexico': '🇲🇽', 'mex': '🇲🇽',
  'Estados Unidos': '🇺🇸', 'USA': '🇺🇸', 'United States': '🇺🇸', 'united states': '🇺🇸', 'usa': '🇺🇸', 'us': '🇺🇸', 'estados unidos': '🇺🇸',
  'Canadá': '🇨🇦', 'Canada': '🇨🇦', 'CAN': '🇨🇦', 'canada': '🇨🇦', 'can': '🇨🇦', 'canadá': '🇨🇦',
  'Argentina': '🇦🇷', 'ARG': '🇦🇷', 'argentina': '🇦🇷', 'arg': '🇦🇷',
  'Brasil': '🇧🇷', 'Brazil': '🇧🇷', 'BRA': '🇧🇷', 'brasil': '🇧🇷', 'brazil': '🇧🇷', 'bra': '🇧🇷',
  'Francia': '🇫🇷', 'France': '🇫🇷', 'FRA': '🇫🇷', 'francia': '🇫🇷', 'france': '🇫🇷', 'fra': '🇫🇷',
  'Alemania': '🇩🇪', 'Germany': '🇩🇪', 'GER': '🇩🇪', 'Deutschland': '🇩🇪', 'alemania': '🇩🇪', 'germany': '🇩🇪', 'ger': '🇩🇪',
  'España': '🇪🇸', 'Spain': '🇪🇸', 'ESP': '🇪🇸', 'españa': '🇪🇸', 'spain': '🇪🇸', 'esp': '🇪🇸',
  'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'ENG': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'england': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'eng': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Portugal': '🇵🇹', 'POR': '🇵🇹', 'portugal': '🇵🇹', 'por': '🇵🇹',
  'Italia': '🇮🇹', 'Italy': '🇮🇹', 'ITA': '🇮🇹', 'italia': '🇮🇹', 'italy': '🇮🇹', 'ita': '🇮🇹',
  'Países Bajos': '🇳🇱', 'Netherlands': '🇳🇱', 'Holanda': '🇳🇱', 'NED': '🇳🇱', 'paises bajos': '🇳🇱', 'netherlands': '🇳🇱', 'holanda': '🇳🇱', 'ned': '🇳🇱',
  'Bélgica': '🇧🇪', 'Belgium': '🇧🇪', 'BEL': '🇧🇪', 'belgica': '🇧🇪', 'belgium': '🇧🇪', 'bel': '🇧🇪', 'bélgica': '🇧🇪',
  'Croacia': '🇭🇷', 'Croatia': '🇭🇷', 'CRO': '🇭🇷', 'croacia': '🇭🇷', 'croatia': '🇭🇷', 'cro': '🇭🇷',
  'Uruguay': '🇺🇾', 'URU': '🇺🇾', 'uruguay': '🇺🇾', 'uru': '🇺🇾',
  'Colombia': '🇨🇴', 'COL': '🇨🇴', 'colombia': '🇨🇴', 'col': '🇨🇴',
  'Chile': '🇨🇱', 'CHI': '🇨🇱', 'chile': '🇨🇱', 'chi': '🇨🇱',
  'Japón': '🇯🇵', 'Japan': '🇯🇵', 'JPN': '🇯🇵', 'japon': '🇯🇵', 'japan': '🇯🇵', 'jpn': '🇯🇵', 'japón': '🇯🇵',
  'Corea del Sur': '🇰🇷', 'South Korea': '🇰🇷', 'Korea Republic': '🇰🇷', 'KOR': '🇰🇷', 'corea del sur': '🇰🇷', 'south korea': '🇰🇷', 'kor': '🇰🇷',
  'Australia': '🇦🇺', 'AUS': '🇦🇺', 'australia': '🇦🇺', 'aus': '🇦🇺',
  'Marruecos': '🇲🇦', 'Morocco': '🇲🇦', 'MAR': '🇲🇦', 'marruecos': '🇲🇦', 'morocco': '🇲🇦', 'mar': '🇲🇦',
  'Senegal': '🇸🇳', 'SEN': '🇸🇳', 'senegal': '🇸🇳', 'sen': '🇸🇳',
  'Nigeria': '🇳🇬', 'NGA': '🇳🇬', 'nigeria': '🇳🇬', 'nga': '🇳🇬',
  'Camerún': '🇨🇲', 'Cameroon': '🇨🇲', 'CMR': '🇨🇲', 'camerun': '🇨🇲', 'cameroon': '🇨🇲', 'cmr': '🇨🇲', 'camerún': '🇨🇲',
  'Egipto': '🇪🇬', 'Egypt': '🇪🇬', 'EGY': '🇪🇬', 'egipto': '🇪🇬', 'egypt': '🇪🇬', 'egy': '🇪🇬',
  'Túnez': '🇹🇳', 'Tunisia': '🇹🇳', 'TUN': '🇹🇳', 'tunez': '🇹🇳', 'tunisia': '🇹🇳', 'tun': '🇹🇳', 'túnez': '🇹🇳',
  'Argelia': '🇩🇿', 'Algeria': '🇩🇿', 'ALG': '🇩🇿', 'argelia': '🇩🇿', 'algeria': '🇩🇿', 'alg': '🇩🇿',
  'Costa Rica': '🇨🇷', 'CRC': '🇨🇷', 'costa rica': '🇨🇷', 'crc': '🇨🇷',
  'Panamá': '🇵🇦', 'Panama': '🇵🇦', 'PAN': '🇵🇦', 'panama': '🇵🇦', 'pan': '🇵🇦', 'panamá': '🇵🇦',
  'Honduras': '🇭🇳', 'HON': '🇭🇳', 'honduras': '🇭🇳', 'hon': '🇭🇳',
  'Jamaica': '🇯🇲', 'JAM': '🇯🇲', 'jamaica': '🇯🇲', 'jam': '🇯🇲',
  'Ecuador': '🇪🇨', 'ECU': '🇪🇨', 'ecuador': '🇪🇨', 'ecu': '🇪🇨',
  'Perú': '🇵🇪', 'Peru': '🇵🇪', 'PER': '🇵🇪', 'peru': '🇵🇪', 'per': '🇵🇪', 'perú': '🇵🇪',
  'Paraguay': '🇵🇾', 'PAR': '🇵🇾', 'paraguay': '🇵🇾', 'par': '🇵🇾',
  'Venezuela': '🇻🇪', 'VEN': '🇻🇪', 'venezuela': '🇻🇪', 'ven': '🇻🇪',
  'Bolivia': '🇧🇴', 'BOL': '🇧🇴', 'bolivia': '🇧🇴', 'bol': '🇧🇴',
  'Arabia Saudita': '🇸🇦', 'Saudi Arabia': '🇸🇦', 'KSA': '🇸🇦', 'arabia saudita': '🇸🇦', 'saudi arabia': '🇸🇦', 'ksa': '🇸🇦',
  'Irán': '🇮🇷', 'Iran': '🇮🇷', 'IRN': '🇮🇷', 'iran': '🇮🇷', 'irn': '🇮🇷', 'irán': '🇮🇷',
  'Qatar': '🇶🇦', 'QAT': '🇶🇦', 'qatar': '🇶🇦', 'qat': '🇶🇦',
  'Irak': '🇮🇶', 'Iraq': '🇮🇶', 'IRQ': '🇮🇶', 'irak': '🇮🇶', 'iraq': '🇮🇶', 'irq': '🇮🇶',
  'Emiratos Árabes Unidos': '🇦🇪', 'UAE': '🇦🇪', 'United Arab Emirates': '🇦🇪', 'emiratos arabes unidos': '🇦🇪', 'uae': '🇦🇪',
  'China': '🇨🇳', 'CHN': '🇨🇳', 'china': '🇨🇳', 'chn': '🇨🇳',
  'India': '🇮🇳', 'IND': '🇮🇳', 'india': '🇮🇳', 'ind': '🇮🇳',
  'Uzbekistán': '🇺🇿', 'Uzbekistan': '🇺🇿', 'UZB': '🇺🇿', 'uzbekistan': '🇺🇿', 'uzb': '🇺🇿', 'uzbekistán': '🇺🇿',
  'Sudáfrica': '🇿🇦', 'South Africa': '🇿🇦', 'RSA': '🇿🇦', 'sudafrica': '🇿🇦', 'south africa': '🇿🇦', 'rsa': '🇿🇦', 'sudáfrica': '🇿🇦',
  'Ghana': '🇬🇭', 'GHA': '🇬🇭', 'ghana': '🇬🇭', 'gha': '🇬🇭',
  'Costa de Marfil': '🇨🇮', 'Ivory Coast': '🇨🇮', 'CIV': '🇨🇮', 'costa de marfil': '🇨🇮', 'ivory coast': '🇨🇮', 'civ': '🇨🇮',
  'Mali': '🇲🇱', 'MLI': '🇲🇱', 'mali': '🇲🇱', 'mli': '🇲🇱',
  'Burkina Faso': '🇧🇫', 'BFA': '🇧🇫', 'burkina faso': '🇧🇫', 'bfa': '🇧🇫',
  'Cabo Verde': '🇨🇻', 'Cape Verde': '🇨🇻', 'CPV': '🇨🇻', 'cabo verde': '🇨🇻', 'cape verde': '🇨🇻', 'cpv': '🇨🇻',
  'Suiza': '🇨🇭', 'Switzerland': '🇨🇭', 'SUI': '🇨🇭', 'suiza': '🇨🇭', 'switzerland': '🇨🇭', 'sui': '🇨🇭',
  'Austria': '🇦🇹', 'AUT': '🇦🇹', 'austria': '🇦🇹', 'aut': '🇦🇹',
  'Dinamarca': '🇩🇰', 'Denmark': '🇩🇰', 'DEN': '🇩🇰', 'dinamarca': '🇩🇰', 'denmark': '🇩🇰', 'den': '🇩🇰',
  'Suecia': '🇸🇪', 'Sweden': '🇸🇪', 'SWE': '🇸🇪', 'suecia': '🇸🇪', 'sweden': '🇸🇪', 'swe': '🇸🇪',
  'Noruega': '🇳🇴', 'Norway': '🇳🇴', 'NOR': '🇳🇴', 'noruega': '🇳🇴', 'norway': '🇳🇴', 'nor': '🇳🇴',
  'Escocia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'SCO': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'escocia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'sco': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Gales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'WAL': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'gales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'wal': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Turquía': '🇹🇷', 'Turkey': '🇹🇷', 'TUR': '🇹🇷', 'turquia': '🇹🇷', 'turkey': '🇹🇷', 'tur': '🇹🇷', 'turquía': '🇹🇷',
  'Polonia': '🇵🇱', 'Poland': '🇵🇱', 'POL': '🇵🇱', 'polonia': '🇵🇱', 'poland': '🇵🇱', 'pol': '🇵🇱',
  'República Checa': '🇨🇿', 'Czech Republic': '🇨🇿', 'CZE': '🇨🇿', 'republica checa': '🇨🇿', 'czech republic': '🇨🇿', 'cze': '🇨🇿', 'república checa': '🇨🇿',
  'Serbia': '🇷🇸', 'SRB': '🇷🇸', 'serbia': '🇷🇸', 'srb': '🇷🇸',
  'Hungría': '🇭🇺', 'Hungary': '🇭🇺', 'HUN': '🇭🇺', 'hungria': '🇭🇺', 'hungary': '🇭🇺', 'hun': '🇭🇺', 'hungría': '🇭🇺',
  'Rumanía': '🇷🇴', 'Romania': '🇷🇴', 'ROU': '🇷🇴', 'rumania': '🇷🇴', 'romania': '🇷🇴', 'rou': '🇷🇴', 'rumanía': '🇷🇴',
  'Ucrania': '🇺🇦', 'Ukraine': '🇺🇦', 'UKR': '🇺🇦', 'ucrania': '🇺🇦', 'ukraine': '🇺🇦', 'ukr': '🇺🇦',
  'Rusia': '🇷🇺', 'Russia': '🇷🇺', 'RUS': '🇷🇺', 'rusia': '🇷🇺', 'russia': '🇷🇺', 'rus': '🇷🇺',
  'Eslovenia': '🇸🇮', 'Slovenia': '🇸🇮', 'SVN': '🇸🇮', 'eslovenia': '🇸🇮', 'slovenia': '🇸🇮', 'svn': '🇸🇮',
  'Albania': '🇦🇱', 'ALB': '🇦🇱', 'albania': '🇦🇱', 'alb': '🇦🇱',
  'Georgia': '🇬🇪', 'GEO': '🇬🇪', 'georgia': '🇬🇪', 'geo': '🇬🇪',
  'Grecia': '🇬🇷', 'Greece': '🇬🇷', 'GRE': '🇬🇷', 'grecia': '🇬🇷', 'greece': '🇬🇷', 'gre': '🇬🇷',
  'Nueva Zelanda': '🇳🇿', 'New Zealand': '🇳🇿', 'NZL': '🇳🇿', 'nueva zelanda': '🇳🇿', 'new zealand': '🇳🇿', 'nzl': '🇳🇿',
  'Haití': '🇭🇹', 'Haiti': '🇭🇹', 'HAI': '🇭🇹', 'haiti': '🇭🇹', 'hai': '🇭🇹', 'haití': '🇭🇹',
  'Trinidad y Tobago': '🇹🇹', 'Trinidad and Tobago': '🇹🇹', 'TRI': '🇹🇹', 'trinidad y tobago': '🇹🇹', 'tri': '🇹🇹',
  'El Salvador': '🇸🇻', 'SLV': '🇸🇻', 'el salvador': '🇸🇻', 'slv': '🇸🇻',
  'Guatemala': '🇬🇹', 'GUA': '🇬🇹', 'guatemala': '🇬🇹', 'gua': '🇬🇹',
  'Curazao': '🇨🇼', 'Curacao': '🇨🇼', 'CUW': '🇨🇼', 'curazao': '🇨🇼', 'curacao': '🇨🇼', 'cuw': '🇨🇼',
  'Tanzania': '🇹🇿', 'TAN': '🇹🇿', 'tanzania': '🇹🇿', 'tan': '🇹🇿',
  'Zambia': '🇿🇲', 'ZAM': '🇿🇲', 'zambia': '🇿🇲', 'zam': '🇿🇲',
  'Congo': '🇨🇩', 'DR Congo': '🇨🇩', 'COD': '🇨🇩', 'congo': '🇨🇩', 'dr congo': '🇨🇩', 'cod': '🇨🇩',
  'Guinea': '🇬🇳', 'GUI': '🇬🇳', 'guinea': '🇬🇳', 'gui': '🇬🇳',
  'Gabón': '🇬🇦', 'Gabon': '🇬🇦', 'GAB': '🇬🇦', 'gabon': '🇬🇦', 'gab': '🇬🇦', 'gabón': '🇬🇦',
  'Egipto': '🇪🇬', 'Egypt': '🇪🇬', 'EGY': '🇪🇬',
  'Austria': '🇦🇹', 'AUT': '🇦🇹',
};

function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function getFlag(teamName) {
  if (!teamName) return '⚽';
  
  if (countryFlags[teamName]) {
    return countryFlags[teamName];
  }
  
  const normalized = normalizeText(teamName);
  
  for (const [key, flag] of Object.entries(countryFlags)) {
    if (normalizeText(key) === normalized) {
      return flag;
    }
  }
  
  for (const [key, flag] of Object.entries(countryFlags)) {
    if (normalizeText(key).includes(normalized) || normalized.includes(normalizeText(key))) {
      return flag;
    }
  }
  
  return '⚽';
}

export default countryFlags;

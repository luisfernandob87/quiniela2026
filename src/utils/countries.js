const COUNTRY_NAMES = {
  af: 'Afganistán', al: 'Albania', de: 'Alemania', sa: 'Arabia Saudita', dz: 'Argelia',
  ar: 'Argentina', au: 'Australia', at: 'Austria', be: 'Bélgica', ba: 'Bosnia & Herzegovina',
  bo: 'Bolivia', br: 'Brasil', cm: 'Camerún', ca: 'Canadá', qa: 'Catar',
  cl: 'Chile', cn: 'China', co: 'Colombia', cd: 'Congo', kr: 'Corea del Sur',
  ci: 'Costa de Marfil', cr: 'Costa Rica', hr: 'Croacia', cw: 'Curaçao',
  dk: 'Dinamarca', ec: 'Ecuador', eg: 'Egipto', sv: 'El Salvador',
  ae: 'Emiratos Árabes', 'gb-sct': 'Escocia', sco: 'Escocia', es: 'España', us: 'Estados Unidos',
  fr: 'Francia', wls: 'Gales', gh: 'Ghana', gt: 'Guatemala', ht: 'Haití',
  hn: 'Honduras', 'gb-eng': 'Inglaterra', iq: 'Irak', ir: 'Irán',
  ie: 'Irlanda', 'gb-nir': 'Irlanda del Norte', is: 'Islandia', it: 'Italia',
  jm: 'Jamaica', jp: 'Japón', jo: 'Jordania', ma: 'Marruecos', mx: 'México',
  ng: 'Nigeria', no: 'Noruega', nz: 'Nueva Zelanda', nl: 'Países Bajos',
  pa: 'Panamá', py: 'Paraguay', pe: 'Perú', pl: 'Polonia', pt: 'Portugal',
  ro: 'Rumania', ru: 'Rusia', sn: 'Senegal', rs: 'Serbia', za: 'Sudáfrica',
  se: 'Suecia', ch: 'Suiza', tn: 'Túnez', tr: 'Turquía', ua: 'Ucrania',
  uy: 'Uruguay', uz: 'Uzbekistán', cv: 'Cabo Verde', cz: 'República Checa',
};

const FLAG_OVERRIDES = {
  sco: 'gb-sct',
};

export function getCountryName(code) {
  if (!code) return '';
  return COUNTRY_NAMES[code] || code;
}

export function getFlagCode(code) {
  if (!code) return 'xx';
  return FLAG_OVERRIDES[code] || code;
}

export default COUNTRY_NAMES;

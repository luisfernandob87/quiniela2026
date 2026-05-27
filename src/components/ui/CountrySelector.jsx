import { useState, useRef, useEffect } from 'react';
import { Input } from './Input';
import { cn } from '../../utils/cn';
import { Search, ChevronDown } from 'lucide-react';

const countries = [
  { name: 'Afganistán', code: 'af' },
  { name: 'Albania', code: 'al' },
  { name: 'Alemania', code: 'de', en: 'Germany' },
  { name: 'Arabia Saudita', code: 'sa', en: 'Saudi Arabia' },
  { name: 'Argelia', code: 'dz', en: 'Algeria' },
  { name: 'Argentina', code: 'ar' },
  { name: 'Australia', code: 'au' },
  { name: 'Austria', code: 'at' },
  { name: 'Bélgica', code: 'be', en: 'Belgium' },
  { name: 'Bosnia & Herzegovina', code: 'ba', en: 'Bosnia and Herzegovina' },
  { name: 'Bolivia', code: 'bo' },
  { name: 'Brasil', code: 'br', en: 'Brazil' },
  { name: 'Camerún', code: 'cm', en: 'Cameroon' },
  { name: 'Canadá', code: 'ca', en: 'Canada' },
  { name: 'Catar', code: 'qa', en: 'Qatar' },
  { name: 'Chile', code: 'cl' },
  { name: 'China', code: 'cn' },
  { name: 'Colombia', code: 'co' },
  { name: 'Corea del Sur', code: 'kr', en: 'South Korea' },
  { name: 'Costa de Marfil', code: 'ci', en: 'Ivory Coast' },
  { name: 'Costa Rica', code: 'cr' },
  { name: 'Croacia', code: 'hr', en: 'Croatia' },
  { name: 'Dinamarca', code: 'dk', en: 'Denmark' },
  { name: 'Ecuador', code: 'ec' },
  { name: 'Egipto', code: 'eg', en: 'Egypt' },
  { name: 'El Salvador', code: 'sv' },
  { name: 'Emiratos Árabes', code: 'ae', en: 'United Arab Emirates' },
  { name: 'España', code: 'es', en: 'Spain' },
  { name: 'Estados Unidos', code: 'us', en: 'United States' },
  { name: 'Francia', code: 'fr', en: 'France' },
  { name: 'Gales', code: 'wls', en: 'Wales' },
  { name: 'Ghana', code: 'gh' },
  { name: 'Guatemala', code: 'gt' },
  { name: 'Haití', code: 'ht', en: 'Haiti' },
  { name: 'Honduras', code: 'hn' },
  { name: 'Inglaterra', code: 'gb-eng', en: 'England' },
  { name: 'Irak', code: 'iq', en: 'Iraq' },
  { name: 'Irán', code: 'ir', en: 'Iran' },
  { name: 'Irlanda', code: 'ie', en: 'Ireland' },
  { name: 'Irlanda del Norte', code: 'gb-nir', en: 'Northern Ireland' },
  { name: 'Islandia', code: 'is', en: 'Iceland' },
  { name: 'Italia', code: 'it', en: 'Italy' },
  { name: 'Jamaica', code: 'jm' },
  { name: 'Japón', code: 'jp', en: 'Japan' },
  { name: 'Marruecos', code: 'ma', en: 'Morocco' },
  { name: 'México', code: 'mx', en: 'Mexico' },
  { name: 'Nigeria', code: 'ng' },
  { name: 'Noruega', code: 'no', en: 'Norway' },
  { name: 'Nueva Zelanda', code: 'nz', en: 'New Zealand' },
  { name: 'Países Bajos', code: 'nl', en: 'Netherlands' },
  { name: 'Panamá', code: 'pa', en: 'Panama' },
  { name: 'Paraguay', code: 'py' },
  { name: 'Perú', code: 'pe', en: 'Peru' },
  { name: 'Polonia', code: 'pl', en: 'Poland' },
  { name: 'Portugal', code: 'pt' },
  { name: 'Rumania', code: 'ro', en: 'Romania' },
  { name: 'Rusia', code: 'ru', en: 'Russia' },
  { name: 'Senegal', code: 'sn' },
  { name: 'Serbia', code: 'rs' },
  { name: 'Sudáfrica', code: 'za', en: 'South Africa' },
  { name: 'Suecia', code: 'se', en: 'Sweden' },
  { name: 'Suiza', code: 'ch', en: 'Switzerland' },
  { name: 'Túnez', code: 'tn', en: 'Tunisia' },
  { name: 'Turquía', code: 'tr', en: 'Turkey' },
  { name: 'Ucrania', code: 'ua', en: 'Ukraine' },
  { name: 'Uruguay', code: 'uy' },
  { name: 'Uzbekistán', code: 'uz', en: 'Uzbekistan' },
  { name: 'Cabo Verde', code: 'cv', en: 'Cape Verde' },
  { name: 'Congo', code: 'cd', en: 'DR Congo' },
  { name: 'Curaçao', code: 'cw' },
  { name: 'Escocia', code: 'gb-sct', en: 'Scotland' },
  { name: 'Jordania', code: 'jo', en: 'Jordan' },
  { name: 'República Checa', code: 'cz', en: 'Czech Republic' },
].sort((a, b) => a.name.localeCompare(b.name, 'es'));

export default function CountrySelector({ value, onChange, id }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const selected = countries.find(c => c.code === value);
  const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const filtered = countries.filter(c =>
    normalize(c.name + ' ' + (c.en || '') + ' ' + c.code).includes(normalize(search))
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(country) {
    onChange(country.code);
    setOpen(false);
    setSearch('');
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-gray-50 transition-colors"
      >
        {selected ? (
          <>
            <img
              src={`https://flagcdn.com/w40/${selected.code}.png`}
              srcSet={`https://flagcdn.com/w80/${selected.code}.png 2x`}
              alt=""
              className="w-6 h-4 object-cover rounded-sm shadow-sm"
            />
            <span className="flex-1 text-left truncate">{selected.name}</span>
          </>
        ) : (
          <span className="flex-1 text-left text-muted-foreground">Seleccionar país</span>
        )}
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-xl">
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar país..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 bg-white"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-60 overflow-auto p-1">
            {filtered.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No se encontraron países
              </div>
            ) : (
              filtered.map(country => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-2.5 text-sm hover:bg-green-50 transition-colors text-left',
                    value === country.code && 'bg-green-100 text-green-900 font-medium'
                  )}
                >
                  <img
                    src={`https://flagcdn.com/w40/${country.code}.png`}
                    srcSet={`https://flagcdn.com/w80/${country.code}.png 2x`}
                    alt=""
                    className="w-6 h-4 object-cover rounded-sm shadow-sm flex-shrink-0"
                  />
                  <span className="truncate">{country.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

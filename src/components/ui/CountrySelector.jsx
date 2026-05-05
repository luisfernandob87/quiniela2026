import { useState, useRef, useEffect } from 'react';
import { Input } from './Input';
import { cn } from '../../utils/cn';
import { Search, ChevronDown } from 'lucide-react';

const countries = [
  { name: 'Afganistán', code: 'af' },
  { name: 'Albania', code: 'al' },
  { name: 'Alemania', code: 'de' },
  { name: 'Arabia Saudita', code: 'sa' },
  { name: 'Argelia', code: 'dz' },
  { name: 'Argentina', code: 'ar' },
  { name: 'Australia', code: 'au' },
  { name: 'Austria', code: 'at' },
  { name: 'Bélgica', code: 'be' },
  { name: 'Bolivia', code: 'bo' },
  { name: 'Brasil', code: 'br' },
  { name: 'Camerún', code: 'cm' },
  { name: 'Canadá', code: 'ca' },
  { name: 'Catar', code: 'qa' },
  { name: 'Chile', code: 'cl' },
  { name: 'China', code: 'cn' },
  { name: 'Colombia', code: 'co' },
  { name: 'Corea del Sur', code: 'kr' },
  { name: 'Costa de Marfil', code: 'ci' },
  { name: 'Costa Rica', code: 'cr' },
  { name: 'Croacia', code: 'hr' },
  { name: 'Dinamarca', code: 'dk' },
  { name: 'Ecuador', code: 'ec' },
  { name: 'Egipto', code: 'eg' },
  { name: 'El Salvador', code: 'sv' },
  { name: 'Emiratos Árabes', code: 'ae' },
  { name: 'España', code: 'es' },
  { name: 'Estados Unidos', code: 'us' },
  { name: 'Francia', code: 'fr' },
  { name: 'Gales', code: 'wls' },
  { name: 'Ghana', code: 'gh' },
  { name: 'Guatemala', code: 'gt' },
  { name: 'Haití', code: 'ht' },
  { name: 'Honduras', code: 'hn' },
  { name: 'Inglaterra', code: 'gb-eng' },
  { name: 'Irak', code: 'iq' },
  { name: 'Irán', code: 'ir' },
  { name: 'Irlanda', code: 'ie' },
  { name: 'Irlanda del Norte', code: 'gb-nir' },
  { name: 'Islandia', code: 'is' },
  { name: 'Italia', code: 'it' },
  { name: 'Jamaica', code: 'jm' },
  { name: 'Japón', code: 'jp' },
  { name: 'Marruecos', code: 'ma' },
  { name: 'México', code: 'mx' },
  { name: 'Nigeria', code: 'ng' },
  { name: 'Noruega', code: 'no' },
  { name: 'Nueva Zelanda', code: 'nz' },
  { name: 'Países Bajos', code: 'nl' },
  { name: 'Panamá', code: 'pa' },
  { name: 'Paraguay', code: 'py' },
  { name: 'Perú', code: 'pe' },
  { name: 'Polonia', code: 'pl' },
  { name: 'Portugal', code: 'pt' },
  { name: 'Rumania', code: 'ro' },
  { name: 'Rusia', code: 'ru' },
  { name: 'Senegal', code: 'sn' },
  { name: 'Serbia', code: 'rs' },
  { name: 'Sudáfrica', code: 'za' },
  { name: 'Suecia', code: 'se' },
  { name: 'Suiza', code: 'ch' },
  { name: 'Túnez', code: 'tn' },
  { name: 'Turquía', code: 'tr' },
  { name: 'Ucrania', code: 'ua' },
  { name: 'Uruguay', code: 'uy' },
].sort((a, b) => a.name.localeCompare(b.name, 'es'));

export default function CountrySelector({ value, onChange, id }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const selected = countries.find(c => c.code === value);
  const filtered = countries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
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

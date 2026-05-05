import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import CountrySelector from '../components/ui/CountrySelector';
import { recalculateAllPoints } from '../utils/scoring';
import { Trash2, Plus, Save, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function Admin() {
  const { currentUser } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    homeTeamCode: '',
    awayTeamCode: '',
    date: '',
    time: '',
    group: '',
    homeScore: '',
    awayScore: ''
  });
  const [hasResult, setHasResult] = useState(false);

  const countryNames = {
    af: 'Afganistán', al: 'Albania', de: 'Alemania', sa: 'Arabia Saudita', dz: 'Argelia',
    ar: 'Argentina', au: 'Australia', at: 'Austria', be: 'Bélgica', bo: 'Bolivia',
    br: 'Brasil', cm: 'Camerún', ca: 'Canadá', qa: 'Catar', cl: 'Chile', cn: 'China',
    co: 'Colombia', kr: 'Corea del Sur', ci: 'Costa de Marfil', cr: 'Costa Rica',
    hr: 'Croacia', dk: 'Dinamarca', ec: 'Ecuador', eg: 'Egipto', sv: 'El Salvador',
    ae: 'Emiratos Árabes', es: 'España', us: 'Estados Unidos', fr: 'Francia',
    wls: 'Gales', gh: 'Ghana', gt: 'Guatemala', ht: 'Haití', hn: 'Honduras',
    'gb-eng': 'Inglaterra', iq: 'Irak', ir: 'Irán', ie: 'Irlanda', 'gb-nir': 'Irlanda del Norte',
    is: 'Islandia', it: 'Italia', jm: 'Jamaica', jp: 'Japón', ma: 'Marruecos',
    mx: 'México', ng: 'Nigeria', no: 'Noruega', nz: 'Nueva Zelanda', nl: 'Países Bajos',
    pa: 'Panamá', py: 'Paraguay', pe: 'Perú', pl: 'Polonia', pt: 'Portugal',
    ro: 'Rumania', ru: 'Rusia', sn: 'Senegal', rs: 'Serbia', za: 'Sudáfrica',
    se: 'Suecia', ch: 'Suiza', tn: 'Túnez', tr: 'Turquía', ua: 'Ucrania',
    uy: 'Uruguay'
  };

  const groups = [
    'Grupo A', 'Grupo B', 'Grupo C', 'Grupo D', 'Grupo E', 'Grupo F',
    'Grupo G', 'Grupo H', 'Grupo I', 'Grupo J', 'Grupo K', 'Grupo L',
    'Octavos de Final', 'Cuartos de Final', 'Semifinales', 'Tercer Lugar', 'Final'
  ];

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    try {
      const q = query(collection(db, 'matches'), orderBy('date'));
      const snapshot = await getDocs(q);
      setMatches(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Error cargando partidos:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.homeTeamCode || !formData.awayTeamCode || !formData.date || !formData.time || !formData.group) {
      return;
    }

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      const matchData = {
        homeTeam: countryNames[formData.homeTeamCode] || formData.homeTeamCode,
        awayTeam: countryNames[formData.awayTeamCode] || formData.awayTeamCode,
        homeTeamCode: formData.homeTeamCode,
        awayTeamCode: formData.awayTeamCode,
        date: dateTime.toISOString(),
        group: formData.group,
        createdAt: new Date().toISOString()
      };

      if (hasResult) {
        matchData.result = {
          homeScore: parseInt(formData.homeScore) || 0,
          awayScore: parseInt(formData.awayScore) || 0
        };
      } else {
        matchData.result = null;
      }

      await addDoc(collection(db, 'matches'), matchData);
      if (hasResult) {
        await recalculateAllPoints(db);
      }
      setFormData({ homeTeamCode: '', awayTeamCode: '', date: '', time: '', group: '', homeScore: '', awayScore: '' });
      setHasResult(false);
      loadMatches();
    } catch (error) {
      console.error('Error agregando partido:', error);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Estás seguro de eliminar este partido?')) return;
    try {
      await deleteDoc(doc(db, 'matches', id));
      loadMatches();
    } catch (error) {
      console.error('Error eliminando partido:', error);
    }
  }

  async function updateResult(matchId, homeScore, awayScore) {
    try {
      await updateDoc(doc(db, 'matches', matchId), {
        result: {
          homeScore: parseInt(homeScore),
          awayScore: parseInt(awayScore)
        }
      });
      await recalculateAllPoints(db);
      loadMatches();
    } catch (error) {
      console.error('Error actualizando resultado:', error);
    }
  }

  async function handleRecalculate() {
    if (!window.confirm('¿Recalcular todos los puntos de los usuarios?')) return;
    try {
      await recalculateAllPoints(db);
      alert('Puntos recalculados correctamente');
    } catch (error) {
      console.error('Error recalculando puntos:', error);
    }
  }

  if (!currentUser?.isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-600">Acceso denegado</h1>
        <p className="mt-2 text-muted-foreground">No tienes permisos de administrador</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Administrar Partidos</h1>
        <Button variant="outline" size="sm" onClick={handleRecalculate}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Recalcular puntos
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Agregar Nuevo Partido</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="homeTeam">Equipo Local</Label>
                <CountrySelector
                  id="homeTeam"
                  value={formData.homeTeamCode}
                  onChange={(code) => setFormData({ ...formData, homeTeamCode: code })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="awayTeam">Equipo Visitante</Label>
                <CountrySelector
                  id="awayTeam"
                  value={formData.awayTeamCode}
                  onChange={(code) => setFormData({ ...formData, awayTeamCode: code })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Hora</Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group">Fase/Grupo</Label>
                <Select
                  id="group"
                  name="group"
                  value={formData.group}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar</option>
                  {groups.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasResult"
                checked={hasResult}
                onChange={(e) => setHasResult(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="hasResult">Agregar resultado final</Label>
            </div>

            {hasResult && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="homeScore">Goles Local</Label>
                  <Input
                    id="homeScore"
                    name="homeScore"
                    type="number"
                    min="0"
                    value={formData.homeScore}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="awayScore">Goles Visitante</Label>
                  <Input
                    id="awayScore"
                    name="awayScore"
                    type="number"
                    min="0"
                    value={formData.awayScore}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Partido
            </Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Partidos Existentes ({matches.length})</h2>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map(match => (
            <Card key={match.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 font-semibold">
                      <img
                        src={`https://flagcdn.com/w40/${match.homeTeamCode || 'xx'}.png`}
                        alt={match.homeTeam}
                        className="w-8 h-5 object-cover rounded shadow-sm"
                      />
                      <span>{match.homeTeam}</span>
                      <span className="text-muted-foreground text-sm">vs</span>
                      <span>{match.awayTeam}</span>
                      <img
                        src={`https://flagcdn.com/w40/${match.awayTeamCode || 'xx'}.png`}
                        alt={match.awayTeam}
                        className="w-8 h-5 object-cover rounded shadow-sm"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {format(new Date(match.date), "dd/MM/yyyy HH:mm")} - {match.group}
                    </div>
                    {match.result && (
                      <div className="mt-1 text-sm font-medium text-primary">
                        Resultado: {match.result.homeScore} - {match.result.awayScore}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!match.result && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const home = prompt('Goles local:');
                          const away = prompt('Goles visitante:');
                          if (home !== null && away !== null) {
                            updateResult(match.id, home, away);
                          }
                        }}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(match.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

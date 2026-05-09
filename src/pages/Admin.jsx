import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import CountrySelector from '../components/ui/CountrySelector';
import { recalculateAllPoints } from '../utils/scoring';
import { Trash2, Plus, Save, RefreshCw, X, Building2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Admin() {
  const { currentUser } = useAuth();
  const [matches, setMatches] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newClientName, setNewClientName] = useState('');
  const [clientError, setClientError] = useState('');
  const [formData, setFormData] = useState({
    homeTeamCode: '',
    awayTeamCode: '',
    date: '',
    time: '',
    group: '',
    homeScore: '',
    awayScore: '',
    clientId: ''
  });
  const [hasResult, setHasResult] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMatch, setModalMatch] = useState(null);
  const [modalHomeScore, setModalHomeScore] = useState('');
  const [modalAwayScore, setModalAwayScore] = useState('');

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
    loadClients();
    loadMatches();
  }, []);

  async function loadClients() {
    try {
      const snapshot = await getDocs(collection(db, 'clients'));
      setClients(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  }

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

  async function handleCreateClient(e) {
    e.preventDefault();
    setClientError('');
    if (!newClientName.trim()) return;
    try {
      await addDoc(collection(db, 'clients'), {
        name: newClientName.trim(),
        createdAt: new Date().toISOString()
      });
      setNewClientName('');
      loadClients();
    } catch (error) {
      console.error('Error creando cliente:', error);
      setClientError(error.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.homeTeamCode || !formData.awayTeamCode || !formData.date || !formData.time || !formData.group || !formData.clientId) {
      return;
    }

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      const client = clients.find(c => c.id === formData.clientId);
      const matchData = {
        homeTeam: countryNames[formData.homeTeamCode] || formData.homeTeamCode,
        awayTeam: countryNames[formData.awayTeamCode] || formData.awayTeamCode,
        homeTeamCode: formData.homeTeamCode,
        awayTeamCode: formData.awayTeamCode,
        date: dateTime.toISOString(),
        dateTimestamp: dateTime.getTime(),
        group: formData.group,
        clientId: formData.clientId,
        clientName: client?.name || '',
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
        await recalculateAllPoints(db, formData.clientId);
      }
      setFormData({ homeTeamCode: '', awayTeamCode: '', date: '', time: '', group: '', homeScore: '', awayScore: '', clientId: '' });
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
      const match = matches.find(m => m.id === matchId);
      await updateDoc(doc(db, 'matches', matchId), {
        result: {
          homeScore: parseInt(homeScore) || 0,
          awayScore: parseInt(awayScore) || 0
        }
      });
      if (match?.clientId) {
        await recalculateAllPoints(db, match.clientId);
      }
      loadMatches();
    } catch (error) {
      console.error('Error actualizando resultado:', error);
    }
  }

  async function handleRecalculate() {
    if (!window.confirm('¿Recalcular todos los puntos de los usuarios?')) return;
    try {
      for (const client of clients) {
        await recalculateAllPoints(db, client.id);
      }
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateClient} className="flex gap-2 mb-4">
            <Input
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="Nombre del nuevo cliente"
              className="flex-1"
            />
            <Button type="submit" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Crear
            </Button>
          </form>
          {clientError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-4">
              {clientError}
            </div>
          )}
          {clients.length > 0 ? (
            <div className="space-y-2">
              {clients.map(client => (
                <div key={client.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <span className="font-medium">{client.name}</span>
                  <span className="text-xs text-muted-foreground">{client.id}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay clientes creados aún</p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Agregar Nuevo Partido</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Cliente</Label>
              <Select
                id="clientId"
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
              >
                <option value="">Seleccionar cliente</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>

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
                    {match.clientName && (
                      <div className="text-xs text-muted-foreground/70 mt-0.5">
                        Cliente: {match.clientName}
                      </div>
                    )}
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
                          setModalMatch(match);
                          setModalHomeScore('');
                          setModalAwayScore('');
                          setModalOpen(true);
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
      {modalOpen && modalMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg border bg-card text-card-foreground shadow-lg w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-6 pb-2">
              <h2 className="text-xl font-bold">Registrar Resultado</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 pt-4 space-y-6">
              <div className="flex items-center justify-center gap-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={`https://flagcdn.com/w40/${modalMatch.homeTeamCode || 'xx'}.png`}
                    alt={modalMatch.homeTeam}
                    className="w-14 h-10 object-cover rounded shadow-sm"
                  />
                  <span className="font-semibold text-sm">{modalMatch.homeTeam}</span>
                </div>
                <span className="text-2xl font-bold text-muted-foreground">vs</span>
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={`https://flagcdn.com/w40/${modalMatch.awayTeamCode || 'xx'}.png`}
                    alt={modalMatch.awayTeam}
                    className="w-14 h-10 object-cover rounded shadow-sm"
                  />
                  <span className="font-semibold text-sm">{modalMatch.awayTeam}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-center block">{modalMatch.homeTeam}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={modalHomeScore}
                    onChange={(e) => setModalHomeScore(e.target.value)}
                    className="text-center text-2xl h-16"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-center block">{modalMatch.awayTeam}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={modalAwayScore}
                    onChange={(e) => setModalAwayScore(e.target.value)}
                    className="text-center text-2xl h-16"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    updateResult(modalMatch.id, modalHomeScore, modalAwayScore);
                    setModalOpen(false);
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

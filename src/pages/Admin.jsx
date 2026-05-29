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
import { getCountryName, getFlagCode } from '../utils/countries';
import { importGroupMatches, hasExistingMatches } from '../utils/importMatches';
import { Trash2, Plus, Save, RefreshCw, X, Building2, Upload, FileDown } from 'lucide-react';
import { format } from 'date-fns';

export default function Admin() {
  const { currentUser } = useAuth();
  const isFullAdmin = currentUser?.isAdmin === true;
  const canManageUsers = currentUser?.canManageUsers === true;
  const [matches, setMatches] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newClientName, setNewClientName] = useState('');
  const [newClientUserControl, setNewClientUserControl] = useState(false);
  const [clientError, setClientError] = useState('');
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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMatch, setModalMatch] = useState(null);
  const [modalHomeScore, setModalHomeScore] = useState('');
  const [modalAwayScore, setModalAwayScore] = useState('');
  const [isEditingResult, setIsEditingResult] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [toggleConfirm, setToggleConfirm] = useState(null);
  const [managerConfirm, setManagerConfirm] = useState(null);
  const [toggleError, setToggleError] = useState('');

  const groups = [
    'Grupo A', 'Grupo B', 'Grupo C', 'Grupo D', 'Grupo E', 'Grupo F',
    'Grupo G', 'Grupo H', 'Grupo I', 'Grupo J', 'Grupo K', 'Grupo L',
    'Dieciseisavos de Final', 'Octavos de Final', 'Cuartos de Final', 'Semifinales', 'Tercer Lugar', 'Final'
  ];

  useEffect(() => {
    loadClients();
    loadMatches();
    loadUsers();
  }, []);

  async function loadClients() {
    try {
      const snapshot = await getDocs(collection(db, 'clients'));
      setClients(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  }

  async function loadUsers() {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const usersData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      usersData.sort((a, b) => a.displayName?.localeCompare(b.displayName) || 0);
      setUsers(usersData);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
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
        enableUserControl: newClientUserControl,
        createdAt: new Date().toISOString()
      });
      setNewClientName('');
      setNewClientUserControl(false);
      loadClients();
    } catch (error) {
      console.error('Error creando cliente:', error);
      setClientError(error.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.homeTeamCode || !formData.awayTeamCode || !formData.date || !formData.time || !formData.group) return;

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      await addDoc(collection(db, 'matches'), {
        homeTeam: getCountryName(formData.homeTeamCode) || formData.homeTeamCode,
        awayTeam: getCountryName(formData.awayTeamCode) || formData.awayTeamCode,
        homeTeamCode: formData.homeTeamCode,
        awayTeamCode: formData.awayTeamCode,
        date: dateTime.toISOString(),
        dateTimestamp: dateTime.getTime(),
        group: formData.group,
        result: hasResult
          ? { homeScore: parseInt(formData.homeScore) || 0, awayScore: parseInt(formData.awayScore) || 0 }
          : null,
        createdAt: new Date().toISOString()
      });
      if (hasResult) {
        for (const client of clients) {
          await recalculateAllPoints(db, client.id);
        }
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
        result: { homeScore: parseInt(homeScore) || 0, awayScore: parseInt(awayScore) || 0 }
      });
      for (const client of clients) {
        await recalculateAllPoints(db, client.id);
      }
      loadMatches();
    } catch (error) {
      console.error('Error actualizando resultado:', error);
    }
  }

  async function clearResult(matchId) {
    try {
      await updateDoc(doc(db, 'matches', matchId), { result: null });
      for (const client of clients) {
        await recalculateAllPoints(db, client.id);
      }
      loadMatches();
    } catch (error) {
      console.error('Error eliminando resultado:', error);
    }
  }

  async function handleToggleUser(userId, enabled) {
    try {
      await updateDoc(doc(db, 'users', userId), { enabled });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, enabled } : u));
      setToggleError('');
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      setToggleError('Error al actualizar: ' + (error.code === 'permission-denied'
        ? 'permiso denegado — las reglas de Firestore no permiten esta acción'
        : error.message));
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

  async function handleImport() {
    const existing = await hasExistingMatches(db);
    if (existing) {
      const ok = window.confirm('Ya existen partidos. ¿Continuar de todas formas? (se agregarán duplicados)');
      if (!ok) return;
    }

    setImportError('');
    setImportSuccess('');
    setImportProgress({ current: 0, total: 0 });
    setImporting(true);
    try {
      const total = await importGroupMatches(db, (current, total) => {
        setImportProgress({ current, total });
      });
      setImportSuccess(`Se importaron ${total} partidos de la fase de grupos correctamente.`);
      loadMatches();
    } catch (error) {
      console.error('Error importando partidos:', error);
      setImportError(error.message);
    } finally {
      setImporting(false);
    }
  }

  if (!isFullAdmin && !canManageUsers) {
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
        <h1 className="text-2xl font-bold">{canManageUsers ? 'Gestión de Usuarios' : 'Administrar Partidos'}</h1>
        {isFullAdmin && (
        <Button variant="outline" size="sm" onClick={handleRecalculate}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Recalcular puntos
        </Button>
        )}
      </div>

      {isFullAdmin && (
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
          <label className="flex items-center gap-2 text-sm mb-4 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={newClientUserControl}
              onChange={(e) => setNewClientUserControl(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            Habilitar control de usuarios (habilitar/deshabilitar)
          </label>
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
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Usuarios por Quiniela
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="space-y-4">
              {(() => {
                const grouped = {};
                const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));
                for (const user of users) {
                  if (canManageUsers && !isFullAdmin && user.clientId !== currentUser?.clientId) continue;
                  const key = user.clientName || user.clientId || 'Sin asignar';
                  if (!grouped[key]) grouped[key] = [];
                  grouped[key].push(user);
                }
                return Object.entries(grouped).map(([groupName, groupUsers]) => {
                  const client = clientMap[groupUsers[0]?.clientId];
                  const hasUserControl = client?.enableUserControl === true;
                  return (
                  <div key={groupName}>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {groupName}
                    </h3>
                    <div className="space-y-1.5">
                      {groupUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {user.displayName || user.email || 'Sin nombre'}
                              {user.isAdmin && (
                                <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">admin</span>
                              )}
                              {user.canManageUsers && (
                                <span className="ml-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">gestor</span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-3">
                            {isFullAdmin && (
                              <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={user.canManageUsers === true}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setManagerConfirm({ userId: user.id, userName: user.displayName || user.email, canManageUsers: user.canManageUsers !== true });
                                  }}
                                  className="h-3.5 w-3.5 rounded border-gray-300 text-amber-500 focus:ring-amber-400 pointer-events-none"
                                  readOnly
                                />
                                <span className="text-muted-foreground">Gestor</span>
                              </label>
                            )}
                            {hasUserControl && (canManageUsers || isFullAdmin) && (
                            <div
                              onClick={() => setToggleConfirm({ userId: user.id, userName: user.displayName || user.email, enabled: user.enabled !== false })}
                              className="flex items-center gap-2 cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={user.enabled !== false}
                                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 pointer-events-none"
                                readOnly
                              />
                              <span className={`text-xs font-medium ${user.enabled !== false ? 'text-green-600' : 'text-red-500'}`}>
                                {user.enabled !== false ? 'Habilitado' : 'Deshabilitado'}
                              </span>
                            </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  );
                });
              })()}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay usuarios registrados aún</p>
          )}
        </CardContent>
      </Card>

      {isFullAdmin && (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importar partidos desde JSON
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Importa los 72 partidos de la fase de grupos del Mundial 2026 desde el archivo <code>partidos.json</code>.
            Los partidos se comparten entre <strong>todos los clientes</strong> — no es necesario importar por cada uno.
          </p>
          <div className="flex items-end gap-3">
            <Button onClick={handleImport} disabled={importing}>
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importando... ({importProgress.current}/{importProgress.total})
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 mr-2" />
                  Importar partidos
                </>
              )}
            </Button>
          </div>
          {importError && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              Error: {importError}
            </div>
          )}
          {importSuccess && (
            <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 p-3 rounded-md">
              {importSuccess}
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {isFullAdmin && (
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
      )}

      {isFullAdmin && (
      <>
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
                        src={`https://flagcdn.com/w40/${getFlagCode(match.homeTeamCode) || 'xx'}.png`}
                        alt={getCountryName(match.homeTeamCode) || match.homeTeam}
                        className="w-8 h-5 object-cover rounded shadow-sm"
                      />
                      <span>{getCountryName(match.homeTeamCode) || match.homeTeam}</span>
                      <span className="text-muted-foreground text-sm">vs</span>
                      <span>{getCountryName(match.awayTeamCode) || match.awayTeam}</span>
                      <img
                        src={`https://flagcdn.com/w40/${getFlagCode(match.awayTeamCode) || 'xx'}.png`}
                        alt={getCountryName(match.awayTeamCode) || match.awayTeam}
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
                    <Button
                      variant={match.result ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => {
                        setModalMatch(match);
                        setModalHomeScore(match.result ? String(match.result.homeScore) : '');
                        setModalAwayScore(match.result ? String(match.result.awayScore) : '');
                        setIsEditingResult(!!match.result);
                        setModalOpen(true);
                      }}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-5 pb-2">
              <h2 className="text-xl font-bold text-white">{isEditingResult ? 'Editar Resultado' : 'Registrar Resultado'}</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 pt-3 space-y-6">
              <div className="flex items-center justify-center gap-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={`https://flagcdn.com/w40/${getFlagCode(modalMatch.homeTeamCode) || 'xx'}.png`}
                    alt={getCountryName(modalMatch.homeTeamCode) || modalMatch.homeTeam}
                    className="w-14 h-10 object-cover rounded shadow-sm border border-gray-600"
                  />
                  <span className="font-semibold text-sm text-white">{getCountryName(modalMatch.homeTeamCode) || modalMatch.homeTeam}</span>
                </div>
                <span className="text-2xl font-bold text-gray-400">vs</span>
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={`https://flagcdn.com/w40/${getFlagCode(modalMatch.awayTeamCode) || 'xx'}.png`}
                    alt={getCountryName(modalMatch.awayTeamCode) || modalMatch.awayTeam}
                    className="w-14 h-10 object-cover rounded shadow-sm border border-gray-600"
                  />
                  <span className="font-semibold text-sm text-white">{getCountryName(modalMatch.awayTeamCode) || modalMatch.awayTeam}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-center block text-gray-300">{getCountryName(modalMatch.homeTeamCode) || modalMatch.homeTeam}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={modalHomeScore}
                    onChange={(e) => setModalHomeScore(e.target.value)}
                    className="text-center text-2xl h-16 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-center block text-gray-300">{getCountryName(modalMatch.awayTeamCode) || modalMatch.awayTeam}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={modalAwayScore}
                    onChange={(e) => setModalAwayScore(e.target.value)}
                    className="text-center text-2xl h-16 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 text-white border-white/30 hover:bg-white/10"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </Button>
                {isEditingResult && (
                  <Button
                    variant="destructive"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => {
                      if (!window.confirm(`¿Eliminar el resultado de ${getCountryName(modalMatch.homeTeamCode) || modalMatch.homeTeam} vs ${getCountryName(modalMatch.awayTeamCode) || modalMatch.awayTeam}?`)) return;
                      clearResult(modalMatch.id);
                      setModalOpen(false);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Quitar resultado
                  </Button>
                )}
                <Button
                  className="flex-1"
                  onClick={() => {
                    const prevScore = modalMatch.result
                      ? `${modalMatch.result.homeScore}-${modalMatch.result.awayScore}`
                      : '—';
                    const newScore = `${modalHomeScore || '0'}-${modalAwayScore || '0'}`;
                    const hTeam = getCountryName(modalMatch.homeTeamCode) || modalMatch.homeTeam;
                    const aTeam = getCountryName(modalMatch.awayTeamCode) || modalMatch.awayTeam;
                    const msg = isEditingResult
                      ? `¿Estás seguro de cambiar el resultado de ${hTeam} vs ${aTeam}?\n\nAnterior: ${prevScore}\nNuevo: ${newScore}`
                      : `¿Registrar resultado de ${hTeam} vs ${aTeam}?\n\n${newScore}`;
                    if (!window.confirm(msg)) return;
                    updateResult(modalMatch.id, modalHomeScore, modalAwayScore);
                    setModalOpen(false);
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isEditingResult ? 'Actualizar' : 'Guardar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
      )}
      {toggleError && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 text-sm rounded-lg">
          {toggleError}
        </div>
      )}
      {toggleConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={(e) => { if (e.target === e.currentTarget) setToggleConfirm(null); }}
        >
          <div className="rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-5 pb-2">
              <h2 className="text-lg font-bold text-white">Confirmar cambio</h2>
              <button
                onClick={() => setToggleConfirm(null)}
                className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 pt-3 space-y-5">
              <p className="text-sm text-gray-300 text-center">
                ¿Estás seguro de {toggleConfirm.enabled ? 'deshabilitar' : 'habilitar'} a <strong className="text-white">{toggleConfirm.userName}</strong>?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 text-white border-white/30 hover:bg-white/10"
                  onClick={() => setToggleConfirm(null)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    handleToggleUser(toggleConfirm.userId, !toggleConfirm.enabled);
                    setToggleConfirm(null);
                  }}
                >
                  {toggleConfirm.enabled ? 'Deshabilitar' : 'Habilitar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {managerConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={(e) => { if (e.target === e.currentTarget) setManagerConfirm(null); }}
        >
          <div className="rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-5 pb-2">
              <h2 className="text-lg font-bold text-white">Confirmar permiso</h2>
              <button
                onClick={() => setManagerConfirm(null)}
                className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 pt-3 space-y-5">
              <p className="text-sm text-gray-300 text-center">
                ¿Estás seguro de {managerConfirm.canManageUsers ? 'asignar' : 'quitar'} permisos de gestor a <strong className="text-white">{managerConfirm.userName}</strong>?
              </p>
              <p className="text-xs text-gray-400 text-center">
                {managerConfirm.canManageUsers
                  ? 'Podrá habilitar/deshabilitar usuarios de su cliente.'
                  : 'Ya no podrá habilitar/deshabilitar usuarios.'}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 text-white border-white/30 hover:bg-white/10"
                  onClick={() => setManagerConfirm(null)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={async () => {
                    await updateDoc(doc(db, 'users', managerConfirm.userId), { canManageUsers: managerConfirm.canManageUsers });
                    setUsers(prev => prev.map(u => u.id === managerConfirm.userId ? { ...u, canManageUsers: managerConfirm.canManageUsers } : u));
                    setManagerConfirm(null);
                  }}
                >
                  {managerConfirm.canManageUsers ? 'Asignar' : 'Quitar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
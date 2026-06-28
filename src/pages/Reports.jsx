import { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMatches, useClients, useClientDoc, useUsersByClient, usePredictionsByClient } from '../hooks/useFirestoreQueries';
import { Card, CardContent } from '../components/ui/Card';
import { Crosshair, Goal, Users } from 'lucide-react';
import { cn } from '../utils/cn';
import { calculatePoints } from '../utils/scoring';

export default function Reports() {
  const { currentUser } = useAuth();
  const canViewAllClients = currentUser?.isAdmin === true && !currentUser?.clientId;
  const { data: allClients = [] } = useClients();
  const [selectedClientId, setSelectedClientId] = useState();
  const effectiveClientId = selectedClientId || currentUser?.clientId || (canViewAllClients ? allClients[0]?.id : undefined);
  const { data: client } = useClientDoc(effectiveClientId);
  const { data: matches = [], isLoading: matchesLoading } = useMatches();
  const { data: usersData = [], isLoading: usersLoading } = useUsersByClient(effectiveClientId);
  const { data: predictions = [], isLoading: predsLoading } = usePredictionsByClient(effectiveClientId);

  const userControlEnabled = client?.enableUserControl === true;

  const loading = matchesLoading || usersLoading || predsLoading || !effectiveClientId;

  const { exactos, ganadores } = useMemo(() => {
    const exactosMap = {};
    const ganadoresMap = {};

    for (const pred of predictions) {
      const match = matches.find(m => m.id === pred.matchId);
      if (!match || !match.result || match.result.homeScore === null) continue;
      const pts = calculatePoints(pred, match.result);
      if (pts === 3) {
        exactosMap[pred.userId] = (exactosMap[pred.userId] || 0) + 1;
      } else if (pts === 1) {
        ganadoresMap[pred.userId] = (ganadoresMap[pred.userId] || 0) + 1;
      }
    }

    const buildRanking = (map) => {
      const enabled = usersData.filter(u => !userControlEnabled || u.enabled !== false);
      const withCounts = enabled.map(u => ({ ...u, count: map[u.id] || 0 }));
      withCounts.sort((a, b) => b.count - a.count);
      return withCounts.map((u, i) => ({ ...u, rank: i + 1 }));
    };

    return {
      exactos: buildRanking(exactosMap),
      ganadores: buildRanking(ganadoresMap),
    };
  }, [predictions, matches, usersData]);

  const currentUserId = currentUser?.uid;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Reportes</h1>
          <p className="text-muted-foreground text-sm">
            {canViewAllClients && client ? `${client.name || client.id} — ` : ''}
            Resultados exactos y aciertos de ganador
          </p>
        </div>
        {canViewAllClients && allClients.length > 1 && (
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <select
              value={effectiveClientId || ''}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
            >
              {allClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.id}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Resultados exactos */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Crosshair className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Resultados Exactos</h2>
                <p className="text-xs text-muted-foreground">Marcador exacto (3 pts)</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {exactos.map((user) => (
                <div
                  key={user.id}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm",
                    currentUserId === user.id && "bg-yellow-50 dark:bg-yellow-500/10 ring-1 ring-yellow-400"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 text-center text-xs font-bold text-muted-foreground flex-shrink-0">{user.rank}</span>
                    <span className="truncate font-medium">{user.displayName}</span>
                    {currentUserId === user.id && (
                      <span className="text-[10px] text-yellow-600 dark:text-yellow-400 bg-yellow-200 dark:bg-yellow-800 px-1.5 py-0.5 rounded-full flex-shrink-0">tú</span>
                    )}
                  </div>
                  <span className="font-bold text-green-600 dark:text-green-400 flex-shrink-0 ml-2">{user.count}</span>
                </div>
              ))}
              {exactos.length === 0 && (
                <p className="text-center py-8 text-muted-foreground text-sm">Sin datos aún</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Solo ganador */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Goal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Solo Ganador</h2>
                <p className="text-xs text-muted-foreground">Acertó ganador, no marcador (1 pt)</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {ganadores.map((user) => (
                <div
                  key={user.id}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm",
                    currentUserId === user.id && "bg-yellow-50 dark:bg-yellow-500/10 ring-1 ring-yellow-400"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 text-center text-xs font-bold text-muted-foreground flex-shrink-0">{user.rank}</span>
                    <span className="truncate font-medium">{user.displayName}</span>
                    {currentUserId === user.id && (
                      <span className="text-[10px] text-yellow-600 dark:text-yellow-400 bg-yellow-200 dark:bg-yellow-800 px-1.5 py-0.5 rounded-full flex-shrink-0">tú</span>
                    )}
                  </div>
                  <span className="font-bold text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2">{user.count}</span>
                </div>
              ))}
              {ganadores.length === 0 && (
                <p className="text-center py-8 text-muted-foreground text-sm">Sin datos aún</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
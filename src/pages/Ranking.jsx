import { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMatches, useClients, useClientDoc, useUsersByClient, usePredictionsByClient } from '../hooks/useFirestoreQueries';
import { Card, CardContent } from '../components/ui/Card';
import { Trophy, Medal, Crown, Star, Users } from 'lucide-react';
import { cn } from '../utils/cn';
import { calculatePoints } from '../utils/scoring';

const PHASES = [
  { id: 'general', label: 'General' },
  { id: 'grupos', label: 'Fase de Grupos' },
  { id: 'dieciseisavos', label: 'Dieciseisavos' },
  { id: 'octavos', label: 'Octavos' },
  { id: 'cuartos', label: 'Cuartos' },
  { id: 'semifinales', label: 'Semifinales' },
  { id: 'tercer_lugar', label: 'Tercer Lugar' },
  { id: 'final', label: 'Final' },
];

function matchInPhase(match, phaseId) {
  if (phaseId === 'general') return true;
  if (phaseId === 'grupos') return match.group?.startsWith('Grupo');
  const phaseMap = {
    dieciseisavos: 'Dieciseisavos de Final',
    octavos: 'Octavos de Final',
    cuartos: 'Cuartos de Final',
    semifinales: 'Semifinales',
    tercer_lugar: 'Tercer Lugar',
    final: 'Final',
  };
  return match.group === phaseMap[phaseId];
}

export default function Ranking() {
  const { currentUser } = useAuth();
  const canViewAllClients = currentUser?.isAdmin === true && !currentUser?.clientId;
  const { data: allClients = [] } = useClients();
  const [selectedClientId, setSelectedClientId] = useState();
  const [selectedPhase, setSelectedPhase] = useState('general');
  const effectiveClientId = selectedClientId || currentUser?.clientId || (canViewAllClients ? allClients[0]?.id : undefined);
  const { data: client } = useClientDoc(effectiveClientId);
  const { data: matches = [], isLoading: matchesLoading } = useMatches();
  const { data: usersData = [], isLoading: usersLoading } = useUsersByClient(effectiveClientId);
  const { data: predictions = [], isLoading: predsLoading } = usePredictionsByClient(effectiveClientId);

  const userControlEnabled = client?.enableUserControl === true;
  const loading = matchesLoading || usersLoading || predsLoading || !effectiveClientId;

  console.log({
    matches: matches.length,
    users: usersData.length,
    predictions: predictions.length,
    effectiveClientId,
    selectedPhase,
  });
  console.log('predictions sample:', predictions.slice(0, 2));
  console.log('matches sample:', matches.slice(0, 2));

  const users = useMemo(() => {
    const enabled = usersData.filter(u => !userControlEnabled || u.enabled !== false);

    const calculatedPoints = {};
    for (const pred of predictions) {
      const match = matches.find(m => m.id === pred.matchId);
      if (!match || !match.result || match.result.homeScore === null) continue;
      if (!matchInPhase(match, selectedPhase)) continue;
      const points = calculatePoints(pred, match.result);
      if (!calculatedPoints[pred.userId]) calculatedPoints[pred.userId] = 0;
      calculatedPoints[pred.userId] += points;
    }

    const withPoints = enabled.map(u => ({ ...u, points: calculatedPoints[u.id] || 0 }));
    withPoints.sort((a, b) => b.points - a.points);
    return withPoints.map((u, i) => ({ ...u, rank: i + 1 }));
  }, [usersData, predictions, matches, userControlEnabled, selectedPhase]);

  function getMedal(rank) {
    if (rank === 1) return { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-400', label: 'Oro' };
    if (rank === 2) return { icon: Medal, color: 'text-gray-300', bg: 'bg-gray-300', label: 'Plata' };
    if (rank === 3) return { icon: Medal, color: 'text-amber-600', bg: 'bg-amber-600', label: 'Bronce' };
    return null;
  }

  const top3 = users.slice(0, 3);
  const showPodium = top3.length > 0 && top3[0].points > 0;
  const rest = showPodium ? users.slice(3) : users;
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
          <h1 className="text-3xl font-bold">Ranking</h1>
          <p className="text-muted-foreground text-sm">
            {canViewAllClients && client ? `${client.name || client.id} — ` : ''}
            {users.length} participantes habilitados
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
        <div className="relative">
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="pl-3 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
          >
            {PHASES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Podium for top 3 */}
      {showPodium && (
        <div className="mb-10">
          <div className="flex items-end justify-center gap-4 sm:gap-6">
            {/* 2nd place */}
            {top3[1] && (
              <PodiumItem
                user={top3[1]}
                medal="Plata"
                icon={Medal}
                color="text-gray-400"
                bg="bg-gradient-to-t from-gray-300 to-gray-200"
                height="h-32"
                className="order-1"
                isCurrentUser={currentUserId === top3[1].id}
              />
            )}
            {/* 1st place */}
            {top3[0] && (
              <PodiumItem
                user={top3[0]}
                medal="Oro"
                icon={Crown}
                color="text-yellow-400"
                bg="bg-gradient-to-t from-yellow-400 to-yellow-300"
                height="h-40"
                className="order-2 scale-105"
                isFirst
                isCurrentUser={currentUserId === top3[0].id}
              />
            )}
            {/* 3rd place */}
            {top3[2] && (
              <PodiumItem
                user={top3[2]}
                medal="Bronce"
                icon={Medal}
                color="text-amber-600"
                bg="bg-gradient-to-t from-amber-600 to-amber-500"
                height="h-24"
                className="order-3"
                isCurrentUser={currentUserId === top3[2].id}
              />
            )}
          </div>
        </div>
      )}

      {/* Rest of rankings (4th place onwards) */}
      <div className="space-y-2">
        {rest.map((user) => (
          <RankingRow
            key={user.id}
            user={user}
            isCurrentUser={currentUser?.uid === user.id}
          />
        ))}
        {users.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay usuarios registrados aún</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PodiumItem({ user, medal, icon: Icon, color, bg, height, className, isFirst, isCurrentUser }) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative">
        <div className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-lg",
          medal === 'Oro' ? 'bg-yellow-400' : medal === 'Plata' ? 'bg-gray-300' : 'bg-amber-600'
        )}>
          <Icon className={cn("w-7 h-7", medal === 'Oro' ? 'text-white' : medal === 'Plata' ? 'text-gray-600' : 'text-white')} />
        </div>
        <span className={cn(
          "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md",
          medal === 'Oro' ? 'bg-yellow-500' : medal === 'Plata' ? 'bg-gray-400' : 'bg-amber-700'
        )}>
          {medal === 'Oro' ? '1' : medal === 'Plata' ? '2' : '3'}
        </span>
      </div>
      <div className={cn(
        "flex flex-col items-center rounded-t-xl px-5 pt-4 pb-2 min-w-[120px] shadow-lg text-white",
        bg
      )}>
        <span className="font-bold text-sm text-center leading-tight">{user.displayName}</span>
        <span className="text-xs opacity-70 mt-0.5">
          {medal}
          {isCurrentUser && (
            <span className="ml-1.5 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">tú</span>
          )}
        </span>
      </div>
      <div className={cn("w-full rounded-b-xl flex items-center justify-center gap-1 text-white font-bold shadow-md", isFirst ? 'bg-yellow-500 py-2' : medal === 'Plata' ? 'bg-gray-400 py-1.5' : 'bg-amber-700 py-1.5')}>
        <Star className={cn("w-3.5 h-3.5", isFirst && 'animate-pulse')} />
        <span className="text-sm">{user.points} pts</span>
      </div>
    </div>
  );
}

function RankingRow({ user, isCurrentUser, isTop3 }) {
  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        isCurrentUser && "ring-2 ring-yellow-400 ring-offset-2 bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-500/10 dark:to-yellow-600/5",
        isTop3 && !isCurrentUser && "border-l-4",
        isTop3 && user.rank === 1 && !isCurrentUser && "border-l-yellow-400",
        isTop3 && user.rank === 2 && !isCurrentUser && "border-l-gray-300",
        isTop3 && user.rank === 3 && !isCurrentUser && "border-l-amber-600",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
              isTop3
                ? user.rank === 1
                  ? "bg-yellow-400 text-white shadow-md"
                  : user.rank === 2
                    ? "bg-gray-300 text-gray-700 shadow-md"
                    : "bg-amber-600 text-white shadow-md"
                : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
            )}>
              {isTop3 && user.rank === 1 ? (
                <Crown className="w-5 h-5" />
              ) : (
                <span>{user.rank}</span>
              )}
            </div>
            <div>
              <h3 className={cn(
                "font-semibold",
                isCurrentUser && "text-black "
              )}>
                {user.displayName}
                {isCurrentUser && (
                  <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-200 dark:bg-yellow-800 px-1.5 py-0.5 rounded-full">tú</span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className={cn(
            "text-right",
            isTop3 && "flex items-center gap-2"
          )}>
            <span className={cn(
              "text-2xl font-extrabold",
              isTop3 && user.rank === 1 && "text-yellow-500",
              isTop3 && user.rank === 2 && "text-gray-400",
              isTop3 && user.rank === 3 && "text-amber-600",
              !isTop3 && "text-primary"
            )}>
              {user.points}
            </span>
            <span className="text-xs text-muted-foreground block sm:inline sm:ml-1">puntos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

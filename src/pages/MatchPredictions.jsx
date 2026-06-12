import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMatches, usePredictionsByClient, useUsersByClient } from '../hooks/useFirestoreQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { getCountryName, getFlagCode } from '../utils/countries';
import { calculatePoints } from '../utils/scoring';
import { Trophy, Star, ArrowLeft, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../utils/cn';

export default function MatchPredictions() {
  const { matchId } = useParams();
  const { currentUser } = useAuth();

  const { data: matches = [] } = useMatches();
  const { data: predictions = [] } = usePredictionsByClient(currentUser?.clientId);
  const { data: users = [] } = useUsersByClient(currentUser?.clientId);

  const match = useMemo(() => matches.find(m => m.id === matchId), [matches, matchId]);

  const usersMap = useMemo(() => {
    const map = {};
    for (const u of users) map[u.id] = u;
    return map;
  }, [users]);

  const matchPredictions = useMemo(() => {
    const filtered = predictions.filter(p => p.matchId === matchId);
    const scored = filtered.map(p => {
      const user = usersMap[p.userId];
      const points = match?.result?.homeScore != null
        ? calculatePoints(p, match.result)
        : null;
      return { ...p, displayName: user?.displayName || user?.email || '—', points };
    });
    scored.sort((a, b) => {
      if (a.points !== b.points) return (b.points || 0) - (a.points || 0);
      return (a.displayName || '').localeCompare(b.displayName || '', 'es');
    });
    return scored;
  }, [predictions, matchId, usersMap, match]);

  const hasResult = match?.result?.homeScore != null;
  const homeName = getCountryName(match?.homeTeamCode) || match?.homeTeam || '';
  const awayName = getCountryName(match?.awayTeamCode) || match?.awayTeam || '';

  if (!match) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Partido no encontrado</p>
        <Link to="/predictions" className="text-primary hover:underline mt-2 inline-block">Volver a predicciones</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fadeInUp">
      <Link to="/predictions" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Volver a predicciones
      </Link>

      <Card className="mb-6 border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-700 text-white py-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">{match.group}</span>
            <span className="text-white/70">{format(new Date(match.date), "d MMM yyyy - HH:mm", { locale: es })}</span>
          </div>
          <CardTitle className="flex items-center justify-center gap-4 text-lg">
            <div className="flex items-center gap-2">
              <img src={`https://flagcdn.com/w40/${getFlagCode(match.homeTeamCode)}.png`} alt="" className="w-8 h-5 object-cover rounded shadow-sm" />
              <span>{homeName}</span>
            </div>
            <span className="text-2xl font-black text-yellow-300">
              {hasResult ? `${match.result.homeScore} - ${match.result.awayScore}` : 'vs'}
            </span>
            <div className="flex items-center gap-2">
              <span>{awayName}</span>
              <img src={`https://flagcdn.com/w40/${getFlagCode(match.awayTeamCode)}.png`} alt="" className="w-8 h-5 object-cover rounded shadow-sm" />
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Pronósticos de los participantes</h2>
        <span className="text-sm text-muted-foreground">({matchPredictions.length})</span>
      </div>

      {matchPredictions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>Nadie ha pronosticado este partido aún</p>
        </div>
      ) : (
        <div className="space-y-2">
          {matchPredictions.map(p => {
            const isCorrect = hasResult && p.points > 0;
            const isExact = hasResult && p.points === 3;
            const isMine = p.userId === currentUser?.uid;
            return (
              <Card key={p.userId} className={cn(
                "border-0 shadow-sm transition-all",
                isMine && "ring-2 ring-yellow-400 ring-offset-2",
                isExact && "bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-500/10 dark:to-yellow-600/5"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {p.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-sm block truncate">
                          {p.displayName}
                          {isMine && <span className="ml-1.5 text-[10px] text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-800 px-1.5 py-0.5 rounded-full">tú</span>}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <img src={`https://flagcdn.com/w40/${getFlagCode(match.homeTeamCode)}.png`} alt="" className="w-5 h-3.5 object-cover rounded shadow-sm" />
                        <span className={cn(
                          "font-bold text-lg tabular-nums w-6 text-center",
                          isExact && "text-yellow-600 dark:text-yellow-400"
                        )}>
                          {p.homeScore}
                        </span>
                      </div>
                      <span className="text-muted-foreground font-light">-</span>
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "font-bold text-lg tabular-nums w-6 text-center",
                          isExact && "text-yellow-600 dark:text-yellow-400"
                        )}>
                          {p.awayScore}
                        </span>
                        <img src={`https://flagcdn.com/w40/${getFlagCode(match.awayTeamCode)}.png`} alt="" className="w-5 h-3.5 object-cover rounded shadow-sm" />
                      </div>
                      {isCorrect && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-4 h-4 fill-yellow-500" />
                          <span className="text-sm font-bold">+{p.points}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

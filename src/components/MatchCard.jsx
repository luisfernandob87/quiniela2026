import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Label } from './ui/Label';
import { calculatePoints } from '../utils/scoring';
import { Star, CheckCircle, Lock, X, Save, Clock } from 'lucide-react';

function getFlagUrl(code, size = 'w40') {
  if (!code) return '';
  return `https://flagcdn.com/${size}/${code}.png`;
}

export default function MatchCard({ match, prediction, onUpdatePrediction, canPredict, hasPrediction }) {
  const [homeScore, setHomeScore] = useState(prediction?.homeScore || '');
  const [awayScore, setAwayScore] = useState(prediction?.awayScore || '');
  const [saved, setSaved] = useState(!!prediction);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (prediction) {
      setHomeScore(prediction.homeScore);
      setAwayScore(prediction.awayScore);
      setSaved(true);
    }
  }, [prediction]);

  function handleSave() {
    setShowConfirm(true);
  }

  function handleConfirmSave() {
    setShowConfirm(false);
    onUpdatePrediction(match.id, {
      homeScore: parseInt(homeScore || '0'),
      awayScore: parseInt(awayScore || '0')
    });
    setSaved(true);
  }

  const hasResult = match.result && match.result.homeScore !== null;
  const points = hasResult && prediction ? calculatePoints(prediction, match.result) : null;
  const isLocked = saved && !hasResult;
  const matchTime = match.dateTimestamp || (match.date ? new Date(match.date).getTime() : 0);
  const isExpired = matchTime > 0 && Date.now() > matchTime;

  return (
    <Card className="w-full overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-2 text-white">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium uppercase tracking-wide flex items-center gap-2">
              {match.group}
              {!hasResult && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${isExpired ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
                  {isExpired ? 'Cerrado' : 'Abierto'}
                </span>
              )}
            </span>
            <span className="opacity-90">
              {format(new Date(match.date), "d MMM yyyy - HH:mm", { locale: es })}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Mobile: centered score with teams */}
          <div className="sm:hidden">
            {/* Home team */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <img
                  src={getFlagUrl(match.homeTeamCode, 'w80')}
                  alt={match.homeTeam}
                  className="w-8 h-6 object-cover rounded shadow-sm flex-shrink-0"
                />
                <span className="font-bold text-sm truncate">{match.homeTeam}</span>
              </div>
              <div className="flex items-center gap-2 ml-2">
                {hasResult ? (
                  <span className="w-14 h-14 rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 text-white text-3xl font-black flex items-center justify-center shadow-inner">
                    {match.result.homeScore}
                  </span>
                ) : (
                  <Input
                    type="number"
                    min="0"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    className="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2"
                    disabled={isLocked || !canPredict}
                  />
                )}
              </div>
            </div>

            {/* Away team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <img
                  src={getFlagUrl(match.awayTeamCode, 'w80')}
                  alt={match.awayTeam}
                  className="w-8 h-6 object-cover rounded shadow-sm flex-shrink-0"
                />
                <span className="font-bold text-sm truncate">{match.awayTeam}</span>
              </div>
              <div className="flex items-center gap-2 ml-2">
                {hasResult ? (
                  <span className="w-14 h-14 rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 text-white text-3xl font-black flex items-center justify-center shadow-inner">
                    {match.result.awayScore}
                  </span>
                ) : (
                  <Input
                    type="number"
                    min="0"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    className="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2"
                    disabled={isLocked || !canPredict}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Desktop: side-by-side */}
          <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div className="flex-1 flex items-center justify-end gap-3">
              <span className="font-bold text-lg text-right">{match.homeTeam}</span>
              <img
                src={getFlagUrl(match.homeTeamCode, 'w80')}
                alt={match.homeTeam}
                className="w-12 h-8 object-cover rounded shadow-md flex-shrink-0"
              />
            </div>

            <div className="flex items-center gap-2 px-4">
              {hasResult ? (
                <div className="flex items-center gap-2">
                  <span className="w-14 h-14 rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 text-white text-4xl font-black flex items-center justify-center shadow-inner">
                    {match.result.homeScore}
                  </span>
                  <span className="text-muted-foreground text-lg font-light">-</span>
                  <span className="w-14 h-14 rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 text-white text-4xl font-black flex items-center justify-center shadow-inner">
                    {match.result.awayScore}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min="0"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    className="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2"
                    disabled={isLocked || !canPredict}
                  />
                  <span className="text-muted-foreground font-light text-lg mx-1">-</span>
                  <Input
                    type="number"
                    min="0"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    className="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2"
                    disabled={isLocked || !canPredict}
                  />
                </div>
              )}
            </div>

            <div className="flex-1 flex items-center gap-3">
              <img
                src={getFlagUrl(match.awayTeamCode, 'w80')}
                alt={match.awayTeam}
                className="w-12 h-8 object-cover rounded shadow-md flex-shrink-0"
              />
              <span className="font-bold text-lg">{match.awayTeam}</span>
            </div>
          </div>

          {!hasResult && !saved && canPredict && (
            <div className="mt-4 flex justify-center">
              <Button
                onClick={handleSave}
                size="lg"
                className="w-full sm:w-auto px-8"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Guardar predicción
              </Button>
            </div>
          )}

          {!hasResult && !saved && isExpired && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-lg py-2.5 px-4">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Predicciones cerradas — El partido ya comenzó</span>
            </div>
          )}

          {isLocked && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg py-2 px-4">
              <Lock className="w-4 h-4" />
              <span>Predicción guardada - Ya no se puede editar</span>
            </div>
          )}

          {hasResult && prediction && (
            <div className="mt-3 text-center text-sm text-muted-foreground">
              Tu pronóstico: {prediction.homeScore} - {prediction.awayScore}
            </div>
          )}

          {points !== null && (
            <div className="mt-4 flex justify-center">
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-medium",
                points > 0 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-500"
              )}>
                <Star className={cn(
                  "w-5 h-5",
                  points > 0 && "fill-yellow-500 text-yellow-500"
                )} />
                <span className="text-base">
                  +{points} {points === 1 ? 'punto' : 'puntos'}
                  {points === 3 && ' ¡Resultado exacto!'}
                  {points === 1 && match.result.homeScore === match.result.awayScore ? ' Empate correcto' : ''}
                  {points === 1 && match.result.homeScore !== match.result.awayScore ? ' Ganador correcto' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg border bg-card text-card-foreground shadow-lg w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-5 pb-2">
              <h2 className="text-lg font-bold">Confirmar predicción</h2>
              <button
                onClick={() => setShowConfirm(false)}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 pt-3 space-y-5">
              <div className="flex items-center justify-center gap-4 text-center">
                <div className="flex flex-col items-center gap-1.5">
                  <img
                    src={getFlagUrl(match.homeTeamCode, 'w80')}
                    alt={match.homeTeam}
                    className="w-12 h-8 object-cover rounded shadow-sm"
                  />
                  <span className="font-semibold text-xs">{match.homeTeam}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 h-12 rounded-lg bg-primary/10 text-primary text-2xl font-black flex items-center justify-center">
                    {homeScore || '0'}
                  </span>
                  <span className="text-muted-foreground text-lg font-light">-</span>
                  <span className="w-12 h-12 rounded-lg bg-primary/10 text-primary text-2xl font-black flex items-center justify-center">
                    {awayScore || '0'}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <img
                    src={getFlagUrl(match.awayTeamCode, 'w80')}
                    alt={match.awayTeam}
                    className="w-12 h-8 object-cover rounded shadow-sm"
                  />
                  <span className="font-semibold text-xs">{match.awayTeam}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleConfirmSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

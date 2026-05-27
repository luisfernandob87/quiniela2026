import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Label } from './ui/Label';
import { calculatePoints } from '../utils/scoring';
import { getCountryName, getFlagCode } from '../utils/countries';
import { cn } from '../utils/cn';
import { Star, CheckCircle, Lock, X, Save, Clock } from 'lucide-react';

function getFlagUrl(code, size = 'w40') {
  if (!code) return '';
  return `https://flagcdn.com/${size}/${getFlagCode(code)}.png`;
}

export default function MatchCard({ match, prediction, onUpdatePrediction, canPredict, hasPrediction }) {
  const homeTeamName = getCountryName(match.homeTeamCode) || match.homeTeam;
  const awayTeamName = getCountryName(match.awayTeamCode) || match.awayTeam;
  const [homeScore, setHomeScore] = useState(prediction?.homeScore || '');
  const [awayScore, setAwayScore] = useState(prediction?.awayScore || '');
  const [saved, setSaved] = useState(!!prediction);
  const [editing, setEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (prediction) {
      setHomeScore(prediction.homeScore);
      setAwayScore(prediction.awayScore);
      setSaved(true);
    }
  }, [prediction]);

  function handleEdit() {
    setEditing(true);
  }

  function handleCancelEdit() {
    setEditing(false);
    setHomeScore(prediction?.homeScore || '');
    setAwayScore(prediction?.awayScore || '');
  }

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
    setEditing(false);
  }

  const hasResult = match.result && match.result.homeScore !== null;
  const points = hasResult && prediction ? calculatePoints(prediction, match.result) : null;
  const isLocked = saved && !hasResult && !editing;
  const matchTime = match.dateTimestamp || (match.date ? new Date(match.date).getTime() : 0);
  const isExpired = matchTime > 0 && Date.now() > matchTime;

  return (
    <>
    <Card className="w-full transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 border-0 shadow-md">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-700 px-4 py-2.5 text-white">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-2">
              {match.group}
              {!hasResult && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                  isExpired
                    ? 'bg-red-500/20 text-red-200 border border-red-400/30'
                    : 'bg-green-400/20 text-green-200 border border-green-400/30'
                )}>
                  {isExpired ? 'Cerrado' : 'Abierto'}
                </span>
              )}
            </span>
            <span className="opacity-80 text-white/70">
              {format(new Date(match.date), "d MMM yyyy - HH:mm", { locale: es })}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Mobile layout */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <img
                  src={getFlagUrl(match.homeTeamCode, 'w80')}
                  alt={homeTeamName}
                  className="w-9 h-7 object-cover rounded shadow-sm flex-shrink-0 border border-gray-200"
                />
                <span className="font-bold text-sm truncate">{homeTeamName}</span>
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
                    className={cn(
                      "w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200",
                      isLocked || !canPredict
                        ? "border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                        : "border-green-300 dark:border-green-600 focus:border-yellow-400 focus:ring-yellow-400/30"
                    )}
                    disabled={isLocked || !canPredict}
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <img
                  src={getFlagUrl(match.awayTeamCode, 'w80')}
                  alt={awayTeamName}
                  className="w-9 h-7 object-cover rounded shadow-sm flex-shrink-0 border border-gray-200"
                />
                <span className="font-bold text-sm truncate">{awayTeamName}</span>
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
                    className={cn(
                      "w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200",
                      isLocked || !canPredict
                        ? "border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                        : "border-green-300 dark:border-green-600 focus:border-yellow-400 focus:ring-yellow-400/30"
                    )}
                    disabled={isLocked || !canPredict}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div className="flex-1 flex items-center justify-end gap-3">
              <span className="font-bold text-lg text-right">{homeTeamName}</span>
              <img
                src={getFlagUrl(match.homeTeamCode, 'w80')}
                alt={homeTeamName}
                className="w-14 h-9 object-cover rounded shadow-md flex-shrink-0 border border-gray-200"
              />
            </div>

            <div className="flex items-center gap-2 px-4">
              {hasResult ? (
                <div className="flex items-center gap-2">
                  <span className="w-16 h-16 rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 text-white text-4xl font-black flex items-center justify-center shadow-inner">
                    {match.result.homeScore}
                  </span>
                  <span className="text-muted-foreground text-xl font-light">-</span>
                  <span className="w-16 h-16 rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 text-white text-4xl font-black flex items-center justify-center shadow-inner">
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
                    className={cn(
                      "w-16 h-16 text-center text-3xl font-bold rounded-xl border-2 transition-all duration-200",
                      isLocked || !canPredict
                        ? "border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                        : "border-green-300 dark:border-green-600 focus:border-yellow-400 focus:ring-yellow-400/30"
                    )}
                    disabled={isLocked || !canPredict}
                  />
                  <span className="text-muted-foreground font-light text-xl mx-1">-</span>
                  <Input
                    type="number"
                    min="0"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    className={cn(
                      "w-16 h-16 text-center text-3xl font-bold rounded-xl border-2 transition-all duration-200",
                      isLocked || !canPredict
                        ? "border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                        : "border-green-300 dark:border-green-600 focus:border-yellow-400 focus:ring-yellow-400/30"
                    )}
                    disabled={isLocked || !canPredict}
                  />
                </div>
              )}
            </div>

            <div className="flex-1 flex items-center gap-3">
              <img
                src={getFlagUrl(match.awayTeamCode, 'w80')}
                alt={awayTeamName}
                className="w-14 h-9 object-cover rounded shadow-md flex-shrink-0 border border-gray-200"
              />
              <span className="font-bold text-lg">{awayTeamName}</span>
            </div>
          </div>

          {/* Save / Update button */}
          {!hasResult && (!saved || editing) && canPredict && (
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={handleSave}
                size="lg"
                className="w-full sm:w-auto px-10 shadow-lg hover:shadow-xl"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {editing ? 'Actualizar predicción' : 'Guardar predicción'}
              </Button>
              {editing && (
                <button
                  onClick={handleCancelEdit}
                  className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  Cancelar edición
                </button>
              )}
            </div>
          )}

          {/* Expired warning */}
          {!hasResult && !saved && isExpired && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg py-2.5 px-4">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Predicciones cerradas — El partido ya comenzó</span>
            </div>
          )}

          {/* Saved prediction — editable */}
          {isLocked && prediction && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg py-2 px-4">
                <Lock className="w-4 h-4 shrink-0" />
                <span>
                  Tu predicción: <strong>{prediction.homeScore} - {prediction.awayScore}</strong>
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="shrink-0"
              >
                Editar
              </Button>
            </div>
          )}

          {/* Prediction shown */}
          {hasResult && prediction && (
            <div className="mt-3 text-center text-sm text-muted-foreground">
              Tu pronóstico: {prediction.homeScore} - {prediction.awayScore}
            </div>
          )}

          {/* Points earned */}
          {points !== null && (
            <div className="mt-4 flex justify-center">
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300",
                points > 0
                  ? "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-500/20 dark:to-yellow-600/10 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-600/30 shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              )}>
                <Star className={cn(
                  "w-5 h-5",
                  points > 0 && "fill-yellow-500 text-yellow-500",
                  points === 3 && "animate-pulse"
                )} />
                <span className="text-base font-semibold text-yellow-500">
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
    </Card>

      {/* Confirmation modal — outside Card to avoid transform conflicts */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={(e) => { if (e.target === e.currentTarget) setShowConfirm(false); }}
        >
          <div className="rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-5 pb-2">
              <h2 className="text-lg font-bold text-white">Confirmar predicción</h2>
              <button
                onClick={() => setShowConfirm(false)}
                className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 pt-3 space-y-5">
              <div className="flex items-center justify-center gap-4 text-center">
                <div className="flex flex-col items-center gap-1.5">
                  <img
                    src={getFlagUrl(match.homeTeamCode, 'w80')}
                    alt={homeTeamName}
                    className="w-14 h-9 object-cover rounded shadow-sm border border-gray-600"
                  />
                  <span className="font-semibold text-xs text-white">{homeTeamName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-700 text-white text-2xl font-black flex items-center justify-center shadow-md">
                    {homeScore || '0'}
                  </span>
                  <span className="text-gray-400 text-lg font-light">-</span>
                  <span className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-700 text-white text-2xl font-black flex items-center justify-center shadow-md">
                    {awayScore || '0'}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <img
                    src={getFlagUrl(match.awayTeamCode, 'w80')}
                    alt={awayTeamName}
                    className="w-14 h-9 object-cover rounded shadow-sm border border-gray-600"
                  />
                  <span className="font-semibold text-xs text-white">{awayTeamName}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 text-white border-white/30 hover:bg-white/10"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancelar
                </Button>
                <Button className="flex-1" variant="gold" onClick={handleConfirmSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

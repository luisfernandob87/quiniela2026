import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, setDoc, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import MatchCard from '../components/MatchCard';
import { Select } from '../components/ui/Select';
import { calculatePoints } from '../utils/scoring';

export default function Predictions() {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [clock, setClock] = useState(Date.now());
  const { currentUser } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => setClock(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!currentUser?.clientId) {
      setLoading(false);
      return;
    }
    loadMatches();
  }, [currentUser]);

  async function loadMatches() {
    try {
      const q = query(collection(db, 'matches'), where('clientId', '==', currentUser.clientId));
      const snapshot = await getDocs(q);
      const matchesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMatches(matchesData);
      await loadPredictions(matchesData);
    } catch (error) {
      console.error('Error cargando partidos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPredictions(matchesData) {
    if (!currentUser) return;
    try {
      const predQuery = query(collection(db, 'predictions'), where('userId', '==', currentUser.uid));
      const predSnapshot = await getDocs(predQuery);
      const preds = {};
      predSnapshot.forEach(d => { preds[d.data().matchId] = d.data(); });
      setPredictions(preds);
    } catch (error) {
      console.error('Error cargando predicciones:', error);
    }
  }

  async function handleUpdatePrediction(matchId, prediction) {
    if (!currentUser) return;
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match) return;

      if (match.result && match.result.homeScore !== null) {
        console.warn('Partido ya tiene resultado');
        return;
      }

      const matchTime = match.dateTimestamp || (match.date ? new Date(match.date).getTime() : 0);
      if (Date.now() > matchTime) {
        console.warn('El partido ya comenzó');
        return;
      }

      const predRef = doc(db, 'predictions', `${currentUser.uid}_${matchId}`);
      await setDoc(predRef, {
        ...prediction,
        userId: currentUser.uid,
        matchId,
        clientId: currentUser.clientId,
        updatedAt: new Date().toISOString()
      });
      setPredictions(prev => ({ ...prev, [matchId]: prediction }));
    } catch (error) {
      console.error('Error guardando predicción:', error);
    }
  }

  const groups = [...new Set(matches.map(m => m.group).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
  const now = clock;
  const sorted = [...matches].sort((a, b) => {
    const aDone = a.result?.homeScore != null || (a.dateTimestamp || new Date(a.date).getTime()) < now;
    const bDone = b.result?.homeScore != null || (b.dateTimestamp || new Date(b.date).getTime()) < now;
    if (aDone !== bDone) return aDone ? 1 : -1;
    return (a.dateTimestamp || new Date(a.date).getTime()) - (b.dateTimestamp || new Date(b.date).getTime());
  });
  const filteredMatches = filter === 'all'
    ? sorted
    : sorted.filter(m => m.group === filter);

  const totalPoints = matches.reduce((sum, match) => {
    if (match.result && predictions[match.id]) {
      return sum + calculatePoints(predictions[match.id], match.result);
    }
    return sum;
  }, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  function canPredict(match) {
    if (match.result && match.result.homeScore !== null) return false;
    const matchTime = match.dateTimestamp || (match.date ? new Date(match.date).getTime() : 0);
    if (matchTime > 0 && Date.now() > matchTime) return false;
    return true;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Predicciones</h1>
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium">Puntos: </span>
            <span className="text-lg font-bold text-primary">{totalPoints}</span>
          </div>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-40"
          >
            <option value="all">Todos</option>
            {groups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </Select>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No hay partidos disponibles aún
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={predictions[match.id]}
              onUpdatePrediction={handleUpdatePrediction}
              canPredict={canPredict(match)}
              hasPrediction={!!predictions[match.id]}
              clock={clock}
            />
          ))}
        </div>
      )}
    </div>
  );
}

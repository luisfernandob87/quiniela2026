import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
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
  const { currentUser } = useAuth();

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    try {
      const q = query(collection(db, 'matches'), orderBy('date'));
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
      const preds = {};
      for (const match of matchesData) {
        const predDoc = await getDoc(doc(db, 'predictions', `${currentUser.uid}_${match.id}`));
        if (predDoc.exists()) {
          preds[match.id] = predDoc.data();
        }
      }
      setPredictions(preds);
    } catch (error) {
      console.error('Error cargando predicciones:', error);
    }
  }

  async function handleUpdatePrediction(matchId, prediction) {
    if (!currentUser) return;
    try {
      const predRef = doc(db, 'predictions', `${currentUser.uid}_${matchId}`);
      await setDoc(predRef, {
        ...prediction,
        userId: currentUser.uid,
        matchId,
        updatedAt: new Date().toISOString()
      });
      setPredictions(prev => ({ ...prev, [matchId]: prediction }));
    } catch (error) {
      console.error('Error guardando predicción:', error);
    }
  }

  const groups = [...new Set(matches.map(m => m.group).filter(Boolean))];
  const filteredMatches = filter === 'all' 
    ? matches 
    : matches.filter(m => m.group === filter);

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
              canPredict={!match.result || match.result.homeScore === null}
              hasPrediction={!!predictions[match.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
